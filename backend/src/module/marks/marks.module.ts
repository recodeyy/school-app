import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationCoreService } from '../../core/notifications/index.js';
import { MarksController } from './marks.controller.js';
import { MarksService } from './marks.service.js';

@Module({
  controllers: [MarksController],
  providers: [MarksService, PrismaService, NotificationCoreService],
  exports: [MarksService],
})
export class MarksModule {}
