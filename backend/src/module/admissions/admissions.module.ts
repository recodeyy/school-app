import { Module } from '@nestjs/common';
import { AdmissionsService } from './admissions.service.js';
import { AdmissionsController } from './admissions.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  controllers: [AdmissionsController],
  providers: [AdmissionsService, PrismaService],
})
export class AdmissionsModule {}
