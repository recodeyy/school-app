import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { ExcelImportService } from './excel-import.service.js';

@ApiTags('Excel Import')
@ApiBearerAuth()
@Controller('import/excel')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExcelImportController {
  constructor(private readonly excelImportService: ExcelImportService) {}

  @Post('students')
  @Roles('ADMIN', 'PRINCIPAL', 'ADMISSION_COUNSELOR')
  @ApiOperation({ summary: 'Bulk import students from Excel (.xlsx)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async importStudents(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.excelImportService.importStudents(file.buffer);
  }

  @Post('parents')
  @Roles('ADMIN', 'PRINCIPAL', 'ADMISSION_COUNSELOR')
  @ApiOperation({ summary: 'Bulk import parents from Excel (.xlsx)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async importParents(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.excelImportService.importParents(file.buffer);
  }

  @Post('teachers')
  @Roles('ADMIN', 'PRINCIPAL')
  @ApiOperation({ summary: 'Bulk import teachers from Excel (.xlsx)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async importTeachers(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.excelImportService.importTeachers(file.buffer);
  }

  @Post('classes')
  @Roles('ADMIN', 'PRINCIPAL')
  @ApiOperation({ summary: 'Bulk import classes from Excel (.xlsx)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async importClasses(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.excelImportService.importClasses(file.buffer);
  }
}
