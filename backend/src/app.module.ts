import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './module/auth/auth.module.js';
import { SchoolSetupModule } from './module/school-setup/school-setup.module.js';
import { UsersModule } from './module/users/users.module.js';
import { AttendanceModule } from './module/attendance/attendance.module.js';
import { HomeworkModule } from './module/homework/homework.module.js';
import { TimetableModule } from './module/timetable/timetable.module.js';
import { MarksModule } from './module/marks/marks.module.js';
import { NoticesModule } from './module/notices/notices.module.js';
import { FeesModule } from './module/fees/fees.module.js';
import { NotificationsModule } from './module/notifications/notifications.module.js';
import { DashboardModule } from './module/dashboard/dashboard.module.js';
import { ExcelImportModule } from './module/excel-import/excel-import.module.js';

@Module({
  imports: [
    AuthModule,
    SchoolSetupModule,
    UsersModule,
    AttendanceModule,
    HomeworkModule,
    TimetableModule,
    MarksModule,
    NoticesModule,
    FeesModule,
    NotificationsModule,
    DashboardModule,
    ExcelImportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
