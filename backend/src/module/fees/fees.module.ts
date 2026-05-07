import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationCoreService } from '../../core/notifications/index.js';
import { FeesController } from './fees.controller.js';
import { FeesService } from './fees.service.js';

@Module({
  controllers: [FeesController],
  providers: [FeesService, PrismaService, NotificationCoreService],
  exports: [FeesService],
})
export class FeesModule {}
