import { Module } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  AcademicYearController,
  ClassesController,
  HolidaysController,
  PeriodsController,
  SectionsController,
  SubjectsController,
} from './controllers/index.js';
import { SchoolSetupService } from './school-setup.service.js';

@Module({
  providers: [SchoolSetupService, PrismaService, RolesGuard],
  controllers: [
    AcademicYearController,
    ClassesController,
    SectionsController,
    SubjectsController,
    PeriodsController,
    HolidaysController,
  ],
  exports: [SchoolSetupService],
})
export class SchoolSetupModule {}
