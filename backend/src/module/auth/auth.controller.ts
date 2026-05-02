import {
  Body,
  Controller,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { Roles } from './decorators/roles.decorator.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'JWT access and refresh tokens',
    schema: {
      example: {
        access_token: 'eyJhbGciOi...',
        refresh_token: 'eyJhbGciOi...',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    return this.authService.login(user);
  }

  @ApiOperation({ summary: 'Exchange a refresh token for new tokens' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({
    description: 'New JWT access and refresh tokens',
    schema: {
      example: {
        access_token: 'eyJhbGciOi...',
        refresh_token: 'eyJhbGciOi...',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Refresh token is required' })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN', 'PRINCIPAL', 'ADMISSION_COUNSELOR')
  @ApiOperation({ summary: 'Create a new user account' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: 'Created user without password hash',
    schema: {
      example: {
        id: 'b6f08a2c-9c0d-4d5d-8dbf-6d0d7b7d6d1a',
        name: 'Jane Admin',
        email: 'jane@example.com',
        role: 'ADMIN',
        isActive: true,
        createdAt: '2026-02-05T14:41:10.000Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated or not allowed' })
  @Post('create')
  async createAccount(@Body() dto: CreateUserDto, @Request() req: any) {
    return this.authService.createUser(dto);
  }
}
