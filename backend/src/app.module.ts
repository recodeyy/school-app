import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './module/auth/auth.module.js';
import { SchoolSetupModule } from './module/school-setup/school-setup.module.js';

@Module({
  imports: [AuthModule, SchoolSetupModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
