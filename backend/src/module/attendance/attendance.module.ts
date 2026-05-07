import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationCoreService } from '../../core/notifications/index.js';
import { AttendanceController } from './attendance.controller.js';
import { AttendanceService } from './attendance.service.js';

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService, PrismaService, NotificationCoreService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
