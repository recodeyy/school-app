import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationCoreService } from '../../core/notifications/index.js';
import { HomeworkController } from './homework.controller.js';
import { HomeworkService } from './homework.service.js';

@Module({
  controllers: [HomeworkController],
  providers: [HomeworkService, PrismaService, NotificationCoreService],
  exports: [HomeworkService],
})
export class HomeworkModule {}
