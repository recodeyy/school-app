import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { StringValue } from 'ms';
import { User } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UserRoles } from './dto/create-user.dto.js';

const ROLE_HIERARCHY: Record<UserRoles, number> = {
  [UserRoles.SUPER_ADMIN]: 6,
  [UserRoles.ADMIN]: 4,
  [UserRoles.PRINCIPAL]: 5,
  [UserRoles.ADMISSION_COUNSELOR]: 3,
  [UserRoles.TEACHER]: 2,
  [UserRoles.PARENT]: 1,
  [UserRoles.STUDENT]: 0,
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return null;
    const { passwordHash, ...result } = user as User;
    return result;
  }

  async getTokens(user: User) {
    const payload = { sub: user.id as string, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'CHANGE_ME',
      expiresIn: (process.env.JWT_EXPIRES_IN as StringValue) || '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'CHANGE_ME_REFRESH',
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN as StringValue) || '7d',
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async login(user: any) {
    return this.getTokens(user);
  }

  async refreshTokens(refreshToken: string) {
    if (!refreshToken)
      throw new BadRequestException('Refresh token is required');
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'CHANGE_ME_REFRESH',
      }) as any;

      if (!payload?.sub)
        throw new UnauthorizedException('Invalid refresh token');

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) throw new UnauthorizedException('User not found');

      // Optionally: check if user is active
      if (!user.isActive) throw new UnauthorizedException('User is disabled');

      // return new tokens
      return this.getTokens(user);
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private canCreateRole(
    creatorRole: UserRoles,
    targetRole: UserRoles,
  ): boolean {
    const creatorRank = ROLE_HIERARCHY[creatorRole];
    const targetRank = ROLE_HIERARCHY[targetRole];

    if (creatorRank === undefined || targetRank === undefined) {
      return false;
    }

    return creatorRank > targetRank;
  }

  async createUser(
    data: {
      name: string;
      email: string;
      password: string;
      role?: UserRoles;
    },
    creator: { role?: UserRoles } | null | undefined,
  ) {
    if (!creator?.role) {
      throw new UnauthorizedException('Creator account is required');
    }

    const role = data.role ?? UserRoles.STUDENT;

    if (!this.canCreateRole(creator.role, role)) {
      throw new ForbiddenException(
        `A user with role ${creator.role} cannot create a ${role} account`,
      );
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new UnauthorizedException('User with this email already exists');
    }

    const hash = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: hash,
        role,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...rest } = user as User;
    return rest;
  }
}
