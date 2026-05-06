import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { parse as csvParse } from 'csv-parse/sync';
import { StaffRole, UserRole } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CreateParentDto,
  MapParentToStudentsDto,
} from './dto/create-parent.dto.js';
import { CreateStaffDto } from './dto/create-staff.dto.js';
import {
  CreateStudentDto,
  ImportStudentDto,
} from './dto/create-student.dto.js';
import {
  CreateTeacherDto,
  ImportTeacherDto,
} from './dto/create-teacher.dto.js';
import {
  ImportResultDto,
  QueryUsersDto,
  UserResponseDto,
} from './dto/query-users.dto.js';

interface ImportError {
  rowNumber: number;
  email: string;
  error: string;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, process.env.BCRYPT_ROUNDS || 10);
  }

  /**
   * Convert user to response DTO
   */
  private async mapUserToResponse(user: any): Promise<UserResponseDto> {
    const studentProfile =
      user.studentProfile && user.role === UserRole.STUDENT
        ? {
            classId: user.studentProfile.classId,
            rollNumber: user.studentProfile.rollNumber ?? undefined,
            admissionNumber: user.studentProfile.admissionNumber ?? undefined,
            dob: user.studentProfile.dob ?? undefined,
            guardianId: user.studentProfile.guardianId ?? undefined,
          }
        : undefined;

    const teacherProfile =
      user.teacherProfile && user.role === UserRole.TEACHER
        ? {
            employeeId: user.teacherProfile.employeeId ?? undefined,
            subjects: user.teacherProfile.subjects || [],
            designation: user.teacherProfile.designation ?? undefined,
          }
        : undefined;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone ?? undefined,
      role: user.role,
      avatarUrl: user.avatarUrl ?? undefined,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt ?? undefined,
      studentProfile,
      teacherProfile,
    };
  }

  /**
   * Create a single student
   */
  async createStudent(dto: CreateStudentDto): Promise<UserResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException(
        `User with email ${dto.email} already exists`,
      );
    }

    const schoolClass = await this.prisma.schoolClass.findUnique({
      where: { id: dto.classId },
    });

    if (!schoolClass) {
      throw new NotFoundException(`Class with ID ${dto.classId} not found`);
    }

    const passwordHash = await this.hashPassword(dto.password);

    try {
      const user = await this.prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            passwordHash,
            role: UserRole.STUDENT,
            isActive: true,
          },
        });

        await tx.studentProfile.create({
          data: {
            userId: newUser.id,
            classId: dto.classId,
            rollNumber: dto.rollNumber,
            admissionNumber: dto.admissionNumber,
            dob: dto.dob ? new Date(dto.dob) : null,
            guardianId: null,
          },
        });

        return newUser;
      });

      const userWithProfile = await this.prisma.user.findUnique({
        where: { id: user.id },
        include: { studentProfile: true, teacherProfile: true },
      });

      return this.mapUserToResponse(userWithProfile);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to create student: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Create a single parent
   */
  async createParent(dto: CreateParentDto): Promise<UserResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException(
        `User with email ${dto.email} already exists`,
      );
    }

    const passwordHash = await this.hashPassword(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          passwordHash,
          role: UserRole.PARENT,
          isActive: true,
        },
        include: { studentProfile: true, teacherProfile: true },
      });

      return this.mapUserToResponse(user);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to create parent: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Create a single teacher
   */
  async createTeacher(dto: CreateTeacherDto): Promise<UserResponseDto> {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException(
        `User with email ${dto.email} already exists`,
      );
    }

    const passwordHash = await this.hashPassword(dto.password);

    try {
      const user = await this.prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            passwordHash,
            role: UserRole.TEACHER,
            isActive: true,
          },
        });

        await tx.teacherProfile.create({
          data: {
            userId: newUser.id,
            employeeId: dto.employeeId,
            subjects: dto.subjects || [],
            designation: dto.designation,
          },
        });

        return newUser;
      });

      const userWithProfile = await this.prisma.user.findUnique({
        where: { id: user.id },
        include: { studentProfile: true, teacherProfile: true },
      });

      return this.mapUserToResponse(userWithProfile);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to create teacher: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Create a single staff member
   */
  async createStaff(dto: CreateStaffDto): Promise<UserResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException(
        `User with email ${dto.email} already exists`,
      );
    }

    let staffRole: StaffRole = StaffRole.ADMIN;
    if (dto.role) {
      if (!Object.values(StaffRole).includes(dto.role)) {
        throw new BadRequestException(
          `Invalid role: ${dto.role}. Valid roles are: ${Object.values(StaffRole).join(', ')}`,
        );
      }
      staffRole = dto.role;
    }

    const passwordHash = await this.hashPassword(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          passwordHash,
          role: staffRole as UserRole,
          isActive: true,
        },
        include: { studentProfile: true, teacherProfile: true },
      });

      return this.mapUserToResponse(user);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to create staff: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Bulk import students from CSV
   */
  async importStudentsFromCSV(csvData: string): Promise<ImportResultDto> {
    const errors: {
      rowNumber: number;
      email: string;
      error: string;
    }[] = [];
    const createdUsers: UserResponseDto[] = [];
    let success = 0;
    let failed = 0;

    try {
      const records = csvParse(csvData, {
        columns: true,
        skip_empty_lines: true,
      }) as ImportStudentDto[];

      for (let i = 0; i < records.length; i++) {
        try {
          const record = records[i];
          const rowNumber = i + 2; // +2 because row 1 is header

          if (
            !record.name ||
            !record.email ||
            !record.password ||
            !record.className
          ) {
            throw new Error(
              'Missing required fields: name, email, password, className',
            );
          }

          const schoolClass = await this.prisma.schoolClass.findFirst({
            where: { name: record.className },
          });

          if (!schoolClass) {
            throw new Error(`Class "${record.className}" not found`);
          }

          const student = await this.createStudent({
            name: record.name,
            email: record.email,
            phone: record.phone,
            password: record.password,
            classId: schoolClass.id,
            rollNumber: record.rollNumber,
            admissionNumber: record.admissionNumber,
            dob: record.dob,
          });

          createdUsers.push(student);
          success++;
        } catch (error) {
          failed++;
          errors.push({
            rowNumber: i + 2,
            email: records[i].email,
            error: (error as Error).message,
          });
        }
      }

      return {
        success,
        failed,
        errors: errors.length > 0 ? errors : undefined,
        createdUsers: createdUsers.length > 0 ? createdUsers : undefined,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to parse CSV: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Bulk import parents from CSV
   */
  async importParentsFromCSV(csvData: string): Promise<ImportResultDto> {
    const errors: {
      rowNumber: number;
      email: string;
      error: string;
    }[] = [];
    const createdUsers: UserResponseDto[] = [];
    let success = 0;
    let failed = 0;

    try {
      const records = csvParse(csvData, {
        columns: true,
        skip_empty_lines: true,
      }) as Array<Record<string, string>>;

      for (let i = 0; i < records.length; i++) {
        try {
          const record = records[i];

          // Validate required fields
          if (!record.name || !record.email || !record.password) {
            throw new Error('Missing required fields: name, email, password');
          }

          // Create parent
          const parent = await this.createParent({
            name: record.name,
            email: record.email,
            phone: record.phone,
            password: record.password,
            relationship: record.relationship,
          });

          createdUsers.push(parent);
          success++;
        } catch (error) {
          failed++;
          errors.push({
            rowNumber: i + 2,
            email: records[i].email,
            error: (error as Error).message,
          });
        }
      }

      return {
        success,
        failed,
        errors: errors.length > 0 ? errors : undefined,
        createdUsers: createdUsers.length > 0 ? createdUsers : undefined,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to parse CSV: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Bulk import teachers from CSV
   */
  async importTeachersFromCSV(csvData: string): Promise<ImportResultDto> {
    const errors: {
      rowNumber: number;
      email: string;
      error: string;
    }[] = [];
    const createdUsers: UserResponseDto[] = [];
    let success = 0;
    let failed = 0;

    try {
      const records = csvParse(csvData, {
        columns: true,
        skip_empty_lines: true,
      }) as ImportTeacherDto[];

      for (let i = 0; i < records.length; i++) {
        try {
          const record = records[i];

          if (!record.name || !record.email || !record.password) {
            throw new Error('Missing required fields: name, email, password');
          }

          const subjects = record.subjects
            ? record.subjects.split(/[,|]/).map((s) => s.trim())
            : [];

          const teacher = await this.createTeacher({
            name: record.name,
            email: record.email,
            phone: record.phone,
            password: record.password,
            employeeId: record.employeeId,
            subjects,
            designation: record.designation,
          });

          createdUsers.push(teacher);
          success++;
        } catch (error) {
          failed++;
          errors.push({
            rowNumber: i + 2,
            email: records[i].email,
            error: (error as Error).message,
          });
        }
      }

      return {
        success,
        failed,
        errors: errors.length > 0 ? errors : undefined,
        createdUsers: createdUsers.length > 0 ? createdUsers : undefined,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to parse CSV: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Bulk import staff from CSV
   */
  async importStaffFromCSV(csvData: string): Promise<ImportResultDto> {
    const errors: {
      rowNumber: number;
      email: string;
      error: string;
    }[] = [];
    const createdUsers: UserResponseDto[] = [];
    let success = 0;
    let failed = 0;

    try {
      const records = csvParse(csvData, {
        columns: true,
        skip_empty_lines: true,
      }) as Array<Record<string, string>>;

      for (let i = 0; i < records.length; i++) {
        try {
          const record = records[i];

          // Validate required fields
          if (!record.name || !record.email || !record.password) {
            throw new Error('Missing required fields: name, email, password');
          }

          // Create staff
          const staff = await this.createStaff({
            name: record.name,
            email: record.email,
            phone: record.phone,
            password: record.password,
            employeeId: record.employeeId,
            designation: record.designation,
            department: record.department,
            role: record.role ? (record.role as StaffRole) : undefined,
          });

          createdUsers.push(staff);
          success++;
        } catch (error) {
          failed++;
          errors.push({
            rowNumber: i + 2,
            email: records[i].email,
            error: (error as Error).message,
          });
        }
      }

      return {
        success,
        failed,
        errors: errors.length > 0 ? errors : undefined,
        createdUsers: createdUsers.length > 0 ? createdUsers : undefined,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to parse CSV: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Map a parent to multiple students
   */
  async mapParentToStudents(
    parentId: string,
    dto: MapParentToStudentsDto,
  ): Promise<{ success: number; failed: number; errors?: ImportError[] }> {
    // Verify parent exists and is actually a parent
    const parent = await this.prisma.user.findUnique({
      where: { id: parentId },
    });

    if (!parent || parent.role !== UserRole.PARENT) {
      throw new NotFoundException(
        `Parent user with ID ${parentId} not found or is not a parent`,
      );
    }

    const errors: ImportError[] = [];
    let success = 0;
    let failed = 0;

    for (const studentId of dto.studentIds) {
      try {
        // Verify student exists
        const student = await this.prisma.user.findUnique({
          where: { id: studentId },
          include: { studentProfile: true },
        });

        if (!student || student.role !== UserRole.STUDENT) {
          throw new NotFoundException(
            `Student with ID ${studentId} not found or is not a student`,
          );
        }

        // Update student profile with guardian ID
        await this.prisma.studentProfile.update({
          where: { userId: studentId },
          data: { guardianId: parentId },
        });

        success++;
      } catch (error) {
        failed++;
        errors.push({
          rowNumber: 0,
          email: studentId,
          error: (error as Error).message,
        });
      }
    }

    return {
      success,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Get all users with filtering and pagination
   */
  async getUsers(query: QueryUsersDto): Promise<{
    success: boolean;
    data: UserResponseDto[];
    pagination?: { total: number; page: number; limit: number };
  }> {
    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.role) {
      where.role = query.role;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where,
      skip,
      take: limit,
      include: { studentProfile: true, teacherProfile: true },
    });

    const total = await this.prisma.user.count({ where });

    const data = await Promise.all(
      users.map((user) => this.mapUserToResponse(user)),
    );

    return {
      success: true,
      data,
      pagination: { total, page, limit },
    };
  }

  /**
   * Get a single user by ID
   */
  async getUser(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { studentProfile: true, teacherProfile: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.mapUserToResponse(user);
  }

  /**
   * Get students by class
   */
  async getStudentsByClass(classId: string): Promise<UserResponseDto[]> {
    const schoolClass = await this.prisma.schoolClass.findUnique({
      where: { id: classId },
    });

    if (!schoolClass) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    const students = await this.prisma.user.findMany({
      where: {
        role: UserRole.STUDENT,
        studentProfile: { classId },
      },
      include: { studentProfile: true, teacherProfile: true },
    });

    return Promise.all(
      students.map((student) => this.mapUserToResponse(student)),
    );
  }

  /**
   * Get children of a parent
   */
  async getParentChildren(parentId: string): Promise<UserResponseDto[]> {
    const parent = await this.prisma.user.findUnique({
      where: { id: parentId },
    });

    if (!parent || parent.role !== UserRole.PARENT) {
      throw new NotFoundException(
        `Parent user with ID ${parentId} not found or is not a parent`,
      );
    }

    const children = await this.prisma.user.findMany({
      where: {
        role: UserRole.STUDENT,
        studentProfile: { guardianId: parentId },
      },
      include: { studentProfile: true, teacherProfile: true },
    });

    return Promise.all(children.map((child) => this.mapUserToResponse(child)));
  }

  /**
   * Get a student's parent/guardian
   */
  async getStudentGuardian(studentId: string): Promise<UserResponseDto | null> {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: { studentProfile: { include: { guardian: true } } },
    });

    if (!student || student.role !== UserRole.STUDENT) {
      throw new NotFoundException(
        `Student with ID ${studentId} not found or is not a student`,
      );
    }

    if (!student.studentProfile?.guardian) {
      return null;
    }

    const guardian = await this.prisma.user.findUnique({
      where: { id: student.studentProfile.guardianId! },
      include: { studentProfile: true, teacherProfile: true },
    });

    return guardian ? this.mapUserToResponse(guardian) : null;
  }

  /**
   * Update user status (active/inactive)
   */
  async updateUserStatus(
    userId: string,
    isActive: boolean,
  ): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
      include: { studentProfile: true, teacherProfile: true },
    });

    return this.mapUserToResponse(updated);
  }
}
