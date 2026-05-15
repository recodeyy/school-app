import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CreateSchoolProfileDto,
  CreateAdmissionLeadDto,
  UpdateLeadStatusDto,
  AssignLeadDto,
  CreateLeadFollowUpDto,
  CreateAdmissionApplicationDto,
  UpdateApplicationStatusDto,
} from './admissions.dto.js';

@Injectable()
export class AdmissionsService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. School Profile
  async getSchoolProfile() {
    let profile = await this.prisma.schoolProfile.findFirst();
    if (!profile) {
      profile = await this.prisma.schoolProfile.create({ data: {} });
    }
    return profile;
  }

  async updateSchoolProfile(dto: CreateSchoolProfileDto) {
    const profile = await this.prisma.schoolProfile.findFirst();
    if (!profile) {
      return this.prisma.schoolProfile.create({ data: dto });
    }
    return this.prisma.schoolProfile.update({
      where: { id: profile.id },
      data: dto,
    });
  }

  // 2. Leads CRM
  async createLead(dto: CreateAdmissionLeadDto) {
    return this.prisma.admissionLead.create({
      data: dto,
    });
  }

  async getLeads(filters: {
    status?: any;
    source?: any;
    counselorId?: string;
  }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.source) where.source = filters.source;
    if (filters.counselorId) where.assignedToId = filters.counselorId;

    return this.prisma.admissionLead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { assignedTo: { select: { id: true, name: true } } },
    });
  }

  async getLeadDetails(id: string) {
    const lead = await this.prisma.admissionLead.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true } },
        followUps: {
          orderBy: { createdAt: 'desc' },
          include: { counselor: { select: { id: true, name: true } } },
        },
        applications: true,
      },
    });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async updateLeadStatus(id: string, dto: UpdateLeadStatusDto) {
    return this.prisma.admissionLead.update({
      where: { id },
      data: { status: dto.status, notes: dto.notes },
    });
  }

  async assignLead(id: string, dto: AssignLeadDto) {
    return this.prisma.admissionLead.update({
      where: { id },
      data: { assignedToId: dto.counselorId },
    });
  }

  // 3. Follow Ups
  async addFollowUp(
    leadId: string,
    counselorId: string,
    dto: CreateLeadFollowUpDto,
  ) {
    return this.prisma.leadFollowUp.create({
      data: {
        leadId,
        counselorId,
        ...dto,
      },
    });
  }

  // 4. Applications
  async createApplication(dto: CreateAdmissionApplicationDto) {
    const application = await this.prisma.admissionApplication.create({
      data: {
        leadId: dto.leadId,
        previousSchool: dto.previousSchool,
        declaration: dto.declaration,
        submittedAt: new Date(),
      },
    });

    // Automatically update lead status to APPLIED
    await this.prisma.admissionLead.update({
      where: { id: dto.leadId },
      data: { status: 'APPLIED' },
    });

    return application;
  }

  async updateApplicationStatus(id: string, dto: UpdateApplicationStatusDto) {
    const app = await this.prisma.admissionApplication.update({
      where: { id },
      data: { status: dto.status },
    });

    if (dto.status === 'APPROVED') {
      await this.prisma.admissionLead.update({
        where: { id: app.leadId },
        data: { status: 'ADMITTED' },
      });
    }

    return app;
  }

  // 5. Dashboard Stats
  async getDashboardStats() {
    const totalLeads = await this.prisma.admissionLead.count();
    const admittedLeads = await this.prisma.admissionLead.count({
      where: { status: 'ADMITTED' },
    });
    const applications = await this.prisma.admissionApplication.count();

    const leadsBySource = await this.prisma.admissionLead.groupBy({
      by: ['source'],
      _count: { source: true },
    });

    const leadsByStatus = await this.prisma.admissionLead.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    return {
      totalLeads,
      admittedLeads,
      applications,
      conversionRate: totalLeads > 0 ? (admittedLeads / totalLeads) * 100 : 0,
      leadsBySource,
      leadsByStatus,
    };
  }

  // Convert Lead to Student Profile
  async convertToStudent(leadId: string, classId: string) {
    const lead = await this.prisma.admissionLead.findUnique({
      where: { id: leadId },
    });
    if (!lead) throw new NotFoundException('Lead not found');
    if (lead.status !== 'ADMITTED') {
      throw new Error('Only admitted leads can be converted to students');
    }

    return await this.prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          name: lead.childName,
          email: lead.email || `student_${lead.id.substring(0, 8)}@school.com`,
          passwordHash: 'generated_hash_placeholder', // Should be properly generated/emailed
          role: 'STUDENT',
        },
      });

      // 2. Create Guardian/Parent User if needed (simplified for now)
      const parent = await tx.user.create({
        data: {
          name: lead.parentName,
          email: `parent_${lead.id.substring(0, 8)}@school.com`, // using a placeholder if email not provided
          passwordHash: 'generated_hash_placeholder',
          role: 'PARENT',
          phone: lead.phone,
        },
      });

      // 3. Create StudentProfile
      const profile = await tx.studentProfile.create({
        data: {
          userId: user.id,
          classId: classId,
          guardianId: parent.id,
          rollNumber: `TEMP-${lead.id.substring(0, 4)}`, // Temporarily generated
          admissionNumber: `ADM-${Date.now()}`,
          dob: new Date(), // placeholder, should be gathered in application
        },
      });

      return { user, parent, profile };
    });
  }
}
