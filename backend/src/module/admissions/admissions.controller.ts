import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdmissionsService } from './admissions.service.js';
import {
  CreateSchoolProfileDto,
  CreateAdmissionLeadDto,
  UpdateLeadStatusDto,
  AssignLeadDto,
  CreateLeadFollowUpDto,
  CreateAdmissionApplicationDto,
  UpdateApplicationStatusDto,
} from './admissions.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@ApiTags('admissions')
@Controller('admissions')
export class AdmissionsController {
  constructor(private readonly admissionsService: AdmissionsService) {}

  // --------------------------------------------------------
  // PUBLIC ENDPOINTS
  // --------------------------------------------------------

  @Get('profile')
  @ApiOperation({ summary: 'Get public school profile/brochure info' })
  getSchoolProfile() {
    return this.admissionsService.getSchoolProfile();
  }

  @Post('enquiry')
  @ApiOperation({ summary: 'Submit an admission enquiry (lead form)' })
  submitEnquiry(@Body() dto: CreateAdmissionLeadDto) {
    return this.admissionsService.createLead(dto);
  }

  // --------------------------------------------------------
  // PROTECTED ENDPOINTS (CRM / Dashboard)
  // --------------------------------------------------------

  @Patch('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'PRINCIPAL', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Update school profile info' })
  updateSchoolProfile(@Body() dto: CreateSchoolProfileDto) {
    return this.admissionsService.updateSchoolProfile(dto);
  }

  @Get('dashboard')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'PRINCIPAL', 'ADMISSION_COUNSELOR', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get admissions dashboard stats' })
  getDashboardStats() {
    return this.admissionsService.getDashboardStats();
  }

  @Get('leads')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'PRINCIPAL', 'ADMISSION_COUNSELOR', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'List admission leads' })
  getLeads(
    @Query('status') status?: any,
    @Query('source') source?: any,
    @Query('counselorId') counselorId?: string,
  ) {
    return this.admissionsService.getLeads({ status, source, counselorId });
  }

  @Get('leads/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'PRINCIPAL', 'ADMISSION_COUNSELOR', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get lead details, follow-ups, and applications' })
  getLeadDetails(@Param('id') id: string) {
    return this.admissionsService.getLeadDetails(id);
  }

  @Patch('leads/:id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'PRINCIPAL', 'ADMISSION_COUNSELOR', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Update lead status' })
  updateLeadStatus(@Param('id') id: string, @Body() dto: UpdateLeadStatusDto) {
    return this.admissionsService.updateLeadStatus(id, dto);
  }

  @Patch('leads/:id/assign')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'PRINCIPAL', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Assign lead to a counselor' })
  assignLead(@Param('id') id: string, @Body() dto: AssignLeadDto) {
    return this.admissionsService.assignLead(id, dto);
  }

  @Post('leads/:id/follow-ups')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'PRINCIPAL', 'ADMISSION_COUNSELOR', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Add a follow-up action/note for a lead' })
  addFollowUp(
    @Param('id') id: string,
    @Body() dto: CreateLeadFollowUpDto,
    @Request() req: any,
  ) {
    return this.admissionsService.addFollowUp(id, req.user.id, dto);
  }

  @Post('applications')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'PRINCIPAL', 'ADMISSION_COUNSELOR', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Submit an admission application' })
  createApplication(@Body() dto: CreateAdmissionApplicationDto) {
    return this.admissionsService.createApplication(dto);
  }

  @Patch('applications/:id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'PRINCIPAL', 'SUPER_ADMIN') // usually only admins can approve
  @ApiOperation({ summary: 'Update admission application status' })
  updateApplicationStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.admissionsService.updateApplicationStatus(id, dto);
  }

  @Post('leads/:id/convert')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'PRINCIPAL', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Convert an admitted lead to a student' })
  convertToStudent(@Param('id') id: string, @Body('classId') classId: string) {
    return this.admissionsService.convertToStudent(id, classId);
  }
}
