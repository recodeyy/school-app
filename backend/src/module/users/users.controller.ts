import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import {
  BulkImportParentsDto,
  CreateParentDto,
  MapParentToStudentsDto,
} from './dto/create-parent.dto.js';
import { BulkImportStaffDto, CreateStaffDto } from './dto/create-staff.dto.js';
import {
  BulkImportStudentsDto,
  CreateStudentDto,
} from './dto/create-student.dto.js';
import {
  BulkImportTeachersDto,
  CreateTeacherDto,
} from './dto/create-teacher.dto.js';
import {
  ImportResultDto,
  QueryUsersDto,
  UserResponseDto,
} from './dto/query-users.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Create a single student
   */
  @Post('students')
  @Roles('ADMIN', 'PRINCIPAL', 'ADMISSION_COUNSELOR')
  @ApiOperation({
    summary: 'Create a single student',
    description:
      'Add a new student user account with student profile and assign to a class',
  })
  @ApiCreatedResponse({
    type: UserResponseDto,
    description: 'Student created successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or class not found',
  })
  @ApiConflictResponse({
    description: 'Email already exists',
  })
  @ApiForbiddenResponse({
    description: 'User role does not have permission',
  })
  async createStudent(
    @Body() createStudentDto: CreateStudentDto,
  ): Promise<UserResponseDto> {
    return this.usersService.createStudent(createStudentDto);
  }

  /**
   * Create a single parent
   */
  @Post('parents')
  @Roles('ADMIN', 'PRINCIPAL', 'ADMISSION_COUNSELOR')
  @ApiOperation({
    summary: 'Create a single parent',
    description: 'Add a new parent/guardian user account',
  })
  @ApiCreatedResponse({
    type: UserResponseDto,
    description: 'Parent created successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiConflictResponse({
    description: 'Email already exists',
  })
  @ApiForbiddenResponse({
    description: 'User role does not have permission',
  })
  async createParent(
    @Body() createParentDto: CreateParentDto,
  ): Promise<UserResponseDto> {
    return this.usersService.createParent(createParentDto);
  }

  /**
   * Create a single teacher
   */
  @Post('teachers')
  @Roles('ADMIN', 'PRINCIPAL', 'ADMISSION_COUNSELOR')
  @ApiOperation({
    summary: 'Create a single teacher',
    description: 'Add a new teacher user account with teacher profile',
  })
  @ApiCreatedResponse({
    type: UserResponseDto,
    description: 'Teacher created successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiConflictResponse({
    description: 'Email already exists',
  })
  @ApiForbiddenResponse({
    description: 'User role does not have permission',
  })
  async createTeacher(
    @Body() createTeacherDto: CreateTeacherDto,
  ): Promise<UserResponseDto> {
    return this.usersService.createTeacher(createTeacherDto);
  }

  /**
   * Create a single staff member
   */
  @Post('staff')
  @Roles('ADMIN', 'PRINCIPAL')
  @ApiOperation({
    summary: 'Create a single staff member',
    description:
      'Add a new staff member account with role assignment (ADMIN, TEACHER, or ADMISSION_COUNSELOR)',
  })
  @ApiCreatedResponse({
    type: UserResponseDto,
    description: 'Staff member created successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or invalid role',
  })
  @ApiConflictResponse({
    description: 'Email already exists',
  })
  @ApiForbiddenResponse({
    description: 'User role does not have permission',
  })
  async createStaff(
    @Body() createStaffDto: CreateStaffDto,
  ): Promise<UserResponseDto> {
    return this.usersService.createStaff(createStaffDto);
  }

  /**
   * Bulk import students from CSV
   */
  @Post('import/students/csv')
  @Roles('ADMIN', 'PRINCIPAL', 'ADMISSION_COUNSELOR')
  @ApiOperation({
    summary: 'Bulk import students from CSV',
    description: `Import multiple students at once using CSV format.

Required columns: name, email, password, className
Optional columns: phone, rollNumber, admissionNumber, dob

Returns detailed result with success/failure counts and per-row errors.`,
  })
  @ApiOkResponse({
    type: ImportResultDto,
    description: 'Import completed with detailed results',
  })
  @ApiBadRequestResponse({
    description: 'Invalid CSV format or missing required fields',
  })
  @ApiForbiddenResponse({
    description: 'User role does not have permission',
  })
  async importStudentsFromCSV(
    @Body() importStudentsDto: BulkImportStudentsDto,
  ): Promise<ImportResultDto> {
    return this.usersService.importStudentsFromCSV(importStudentsDto.csvData);
  }

  /**
   * Bulk import parents from CSV
   */
  @Post('import/parents/csv')
  @Roles('ADMIN', 'PRINCIPAL', 'ADMISSION_COUNSELOR')
  @ApiOperation({
    summary: 'Bulk import parents from CSV',
    description: `Import multiple parents at once using CSV format.

Required columns: name, email, password
Optional columns: phone, relationship

Returns detailed result with success/failure counts and per-row errors.`,
  })
  @ApiOkResponse({
    type: ImportResultDto,
    description: 'Import completed with detailed results',
  })
  @ApiBadRequestResponse({
    description: 'Invalid CSV format or missing required fields',
  })
  @ApiForbiddenResponse({
    description: 'User role does not have permission',
  })
  async importParentsFromCSV(
    @Body() importParentsDto: BulkImportParentsDto,
  ): Promise<ImportResultDto> {
    return this.usersService.importParentsFromCSV(importParentsDto.csvData);
  }

  /**
   * Bulk import teachers from CSV
   */
  @Post('import/teachers/csv')
  @Roles('ADMIN', 'PRINCIPAL')
  @ApiOperation({
    summary: 'Bulk import teachers from CSV',
    description: `Import multiple teachers at once using CSV format.

Required columns: name, email, password
Optional columns: phone, employeeId, subjects, designation

Subjects can be comma or pipe separated (e.g., "Math,English" or "Math|English")
Returns detailed result with success/failure counts and per-row errors.`,
  })
  @ApiOkResponse({
    type: ImportResultDto,
    description: 'Import completed with detailed results',
  })
  @ApiBadRequestResponse({
    description: 'Invalid CSV format or missing required fields',
  })
  @ApiForbiddenResponse({
    description: 'User role does not have permission',
  })
  async importTeachersFromCSV(
    @Body() importTeachersDto: BulkImportTeachersDto,
  ): Promise<ImportResultDto> {
    return this.usersService.importTeachersFromCSV(importTeachersDto.csvData);
  }

  /**
   * Bulk import staff from CSV
   */
  @Post('import/staff/csv')
  @Roles('ADMIN', 'PRINCIPAL')
  @ApiOperation({
    summary: 'Bulk import staff from CSV',
    description: `Import multiple staff members at once using CSV format.

Required columns: name, email, password
Optional columns: phone, employeeId, designation, department, role

Valid roles: ADMIN (default), TEACHER, ADMISSION_COUNSELOR
Returns detailed result with success/failure counts and per-row errors.`,
  })
  @ApiOkResponse({
    type: ImportResultDto,
    description: 'Import completed with detailed results',
  })
  @ApiBadRequestResponse({
    description: 'Invalid CSV format or missing required fields',
  })
  @ApiForbiddenResponse({
    description: 'User role does not have permission',
  })
  async importStaffFromCSV(
    @Body() importStaffDto: BulkImportStaffDto,
  ): Promise<ImportResultDto> {
    return this.usersService.importStaffFromCSV(importStaffDto.csvData);
  }

  /**
   * Map a parent to multiple students
   */
  @Patch(':parentId/map-students')
  @Roles('ADMIN', 'PRINCIPAL', 'ADMISSION_COUNSELOR')
  @ApiOperation({
    summary: 'Map a parent to multiple students',
    description:
      'Associate a parent/guardian with one or more students (create guardian relationships)',
  })
  @ApiParam({
    name: 'parentId',
    description: 'UUID of the parent user',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Mapping completed with success/failure counts',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiNotFoundResponse({
    description: 'Parent or student not found',
  })
  @ApiForbiddenResponse({
    description: 'User role does not have permission',
  })
  async mapParentToStudents(
    @Param('parentId') parentId: string,
    @Body() mapParentToStudentsDto: MapParentToStudentsDto,
  ): Promise<{ success: number; failed: number }> {
    return this.usersService.mapParentToStudents(
      parentId,
      mapParentToStudentsDto,
    );
  }

  /**
   * Get all users with filtering and pagination
   */
  @Get()
  @Roles('ADMIN', 'PRINCIPAL', 'TEACHER', 'ADMISSION_COUNSELOR')
  @ApiOperation({
    summary: 'Get all users',
    description:
      'List users with optional filtering by role, class, or search term. Supports pagination.',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    description: 'Filter by user role (ADMIN, TEACHER, STUDENT, PARENT, etc.)',
    example: 'STUDENT',
  })
  @ApiQuery({
    name: 'classId',
    required: false,
    description: 'Filter students by class UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by name or email (case-insensitive)',
    example: 'john',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    example: '1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 20)',
    example: '20',
  })
  @ApiOkResponse({
    description: 'Users list with pagination info',
  })
  @ApiForbiddenResponse({
    description: 'User role does not have permission',
  })
  async getUsers(@Query() queryUsersDto: QueryUsersDto): Promise<{
    success: boolean;
    data: UserResponseDto[];
    pagination?: { total: number; page: number; limit: number };
  }> {
    return this.usersService.getUsers(queryUsersDto);
  }

  /**
   * Get a user by ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve detailed information about a specific user',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    type: UserResponseDto,
    description: 'User details',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  async getUser(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.getUser(id);
  }

  /**
   * Get students in a class
   */
  @Get('class/:classId/students')
  @Roles('ADMIN', 'PRINCIPAL', 'TEACHER', 'ADMISSION_COUNSELOR')
  @ApiOperation({
    summary: 'Get all students in a class',
    description: 'Retrieve all student users enrolled in a specific class',
  })
  @ApiParam({
    name: 'classId',
    description: 'Class UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    type: [UserResponseDto],
    description: 'List of students in the class',
  })
  @ApiNotFoundResponse({
    description: 'Class not found',
  })
  @ApiForbiddenResponse({
    description: 'User role does not have permission',
  })
  async getStudentsByClass(
    @Param('classId') classId: string,
  ): Promise<UserResponseDto[]> {
    return this.usersService.getStudentsByClass(classId);
  }

  /**
   * Get children of a parent
   */
  @Get(':parentId/children')
  @Roles('ADMIN', 'PRINCIPAL', 'PARENT', 'ADMISSION_COUNSELOR')
  @ApiOperation({
    summary: 'Get all children of a parent',
    description:
      'Retrieve all students (children) associated with a parent/guardian',
  })
  @ApiParam({
    name: 'parentId',
    description: 'Parent user UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    type: [UserResponseDto],
    description: 'List of students with parent as guardian',
  })
  @ApiNotFoundResponse({
    description: 'Parent not found',
  })
  @ApiForbiddenResponse({
    description: 'User role does not have permission',
  })
  async getParentChildren(
    @Param('parentId') parentId: string,
  ): Promise<UserResponseDto[]> {
    return this.usersService.getParentChildren(parentId);
  }

  /**
   * Get guardian of a student
   */
  @Get(':studentId/guardian')
  @Roles('ADMIN', 'PRINCIPAL', 'STUDENT', 'PARENT', 'ADMISSION_COUNSELOR')
  @ApiOperation({
    summary: "Get a student's guardian/parent",
    description:
      'Retrieve the parent/guardian information for a specific student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student user UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    type: UserResponseDto,
    description: "Student's guardian information",
    isArray: false,
  })
  @ApiNotFoundResponse({
    description: 'Student not found or has no guardian assigned',
  })
  @ApiForbiddenResponse({
    description: 'User role does not have permission',
  })
  async getStudentGuardian(
    @Param('studentId') studentId: string,
  ): Promise<UserResponseDto | null> {
    return this.usersService.getStudentGuardian(studentId);
  }

  /**
   * Update user status (active/inactive)
   */
  @Patch(':userId/status')
  @Roles('ADMIN', 'PRINCIPAL', 'ADMISSION_COUNSELOR')
  @ApiOperation({
    summary: 'Update user status',
    description:
      'Activate or deactivate a user account. Deactivated users cannot log in.',
  })
  @ApiParam({
    name: 'userId',
    description: 'User UUID to update',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    type: UserResponseDto,
    description: 'Updated user with new status',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiForbiddenResponse({
    description: 'User role does not have permission',
  })
  async updateUserStatus(
    @Param('userId') userId: string,
    @Body('isActive') isActive: boolean,
  ): Promise<UserResponseDto> {
    return this.usersService.updateUserStatus(userId, isActive);
  }
}
