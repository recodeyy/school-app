import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationCoreService } from '../../core/notifications/index.js';
import { NoticesController } from './notices.controller.js';
import { NoticesService } from './notices.service.js';

@Module({
  controllers: [NoticesController],
  providers: [NoticesService, PrismaService, NotificationCoreService],
  exports: [NoticesService],
})
export class NoticesModule {}
