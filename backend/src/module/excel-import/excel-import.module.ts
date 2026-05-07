import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { SchoolSetupModule } from '../school-setup/school-setup.module.js';
import { ExcelImportController } from './excel-import.controller.js';
import { ExcelImportService } from './excel-import.service.js';

@Module({
  imports: [UsersModule, SchoolSetupModule],
  controllers: [ExcelImportController],
  providers: [ExcelImportService],
})
export class ExcelImportModule {}
