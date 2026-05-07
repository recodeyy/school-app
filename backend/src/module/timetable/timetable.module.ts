import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { TimetableController } from './timetable.controller.js';
import { TimetableService } from './timetable.service.js';

@Module({
  controllers: [TimetableController],
  providers: [TimetableService, PrismaService],
  exports: [TimetableService],
})
export class TimetableModule {}
