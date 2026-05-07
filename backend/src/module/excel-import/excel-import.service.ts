import { Injectable, BadRequestException } from '@nestjs/common';
import * as xlsx from 'xlsx';
import { UsersService } from '../users/users.service.js';
import { SchoolSetupService } from '../school-setup/school-setup.service.js';

@Injectable()
export class ExcelImportService {
  constructor(
    private readonly usersService: UsersService,
    private readonly schoolSetupService: SchoolSetupService,
  ) {}

  private parseExcelBuffer(buffer: Buffer): any[] {
    try {
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) throw new Error('No sheets found in Excel file');
      const sheet = workbook.Sheets[sheetName];
      return xlsx.utils.sheet_to_json(sheet);
    } catch (e: any) {
      throw new BadRequestException(`Failed to parse Excel file: ${e.message}`);
    }
  }

  async importStudents(buffer: Buffer) {
    const records = this.parseExcelBuffer(buffer);
    if (!records.length) throw new BadRequestException('No records found');

    // Convert records to CSV format string so we can reuse the robust UsersService logic
    // This is a quick way to reuse the complex CSV import logic without duplicating it
    const csvData = xlsx.utils.sheet_to_csv(xlsx.read(buffer, { type: 'buffer' }).Sheets[xlsx.read(buffer, { type: 'buffer' }).SheetNames[0]]);
    return this.usersService.importStudentsFromCSV(csvData);
  }

  async importParents(buffer: Buffer) {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const csvData = xlsx.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]]);
    return this.usersService.importParentsFromCSV(csvData);
  }

  async importTeachers(buffer: Buffer) {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const csvData = xlsx.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]]);
    return this.usersService.importTeachersFromCSV(csvData);
  }

  async importClasses(buffer: Buffer) {
    const records = this.parseExcelBuffer(buffer);
    if (!records.length) throw new BadRequestException('No records found');

    let success = 0;
    let failed = 0;
    const errors: any[] = [];

    for (let i = 0; i < records.length; i++) {
      try {
        const record = records[i];
        if (!record.name || !record.academicYear) {
          throw new Error('Missing required fields: name, academicYear');
        }
        await this.schoolSetupService.createClass({
          name: record.name,
          academicYear: record.academicYear,
        });
        success++;
      } catch (err: any) {
        failed++;
        errors.push({ row: i + 2, error: err.message });
      }
    }

    return { success, failed, errors };
  }
}
