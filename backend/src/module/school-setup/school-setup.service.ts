import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import type {
  SchoolClass,
  Subject,
  TimetableSlot,
} from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

// Local interfaces for newly added Prisma models. After running `prisma generate` you can replace
// these with imports from the generated client (e.g. import type { AcademicYear } from '../../generated/prisma/client.js')
export type AcademicYear = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
};

export type Section = {
  id: string;
  name: string;
  classId: string;
};

export type Holiday = {
  id: string;
  name: string;
  date: Date;
  description?: string | null;
  isRecurring: boolean;
  createdAt: Date;
};

@Injectable()
export class SchoolSetupService {
  constructor(private readonly prisma: PrismaService) {}

  private get dbAny() {
    return this.prisma as any;
  }

  private get hasAcademicModel(): boolean {
    return Boolean(this.dbAny?.academicYear);
  }

  private mapRowToAcademicYear(row: any): AcademicYear {
    if (!row) return row;
    return {
      id: row.id,
      name: row.name,
      startDate: row.start_date
        ? new Date(row.start_date)
        : row.startDate
          ? new Date(row.startDate)
          : new Date(row.start_date),
      endDate: row.end_date
        ? new Date(row.end_date)
        : row.endDate
          ? new Date(row.endDate)
          : new Date(row.end_date),
      isActive: row.is_active ?? row.isActive ?? false,
    } as AcademicYear;
  }

  /* ---------------- Academic Years ---------------- */
  async createAcademicYear(data: {
    name: string;
    startDate: Date;
    endDate: Date;
    isActive?: boolean;
  }): Promise<AcademicYear> {
    const isActive = !!data.isActive;

    // If the generated Prisma client includes the model, use it.
    if (this.hasAcademicModel) {
      if (isActive) {
        await this.prisma.$transaction(async (tx) => {
          const t: any = tx as any;
          await t.academicYear.updateMany({
            where: { isActive: true },
            data: { isActive: false },
          });
          return t.academicYear.create({ data });
        });
        return this.dbAny.academicYear.findFirst({
          where: { name: data.name, startDate: data.startDate },
        }) as Promise<AcademicYear>;
      }

      return this.prisma.academicYear.create({ data }) as Promise<AcademicYear>;
    }

    // Fallback: use raw SQL queries. This is only for runtime resilience when the Prisma client hasn't been regenerated
    // after schema changes. Prefer running `npx prisma generate` and migrations for production usage.
    // First ensure the tenant table exists
    const existsResult: any = await this.dbAny.$queryRaw`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'tenant' AND table_name = 'academic_years'
      ) as exists
    `;

    const exists = Array.isArray(existsResult)
      ? !!existsResult[0]?.exists
      : !!existsResult?.exists;
    if (!exists) {
      throw new InternalServerErrorException(
        'AcademicYear table not found in the database. Run prisma migrate and prisma generate before using this endpoint.',
      );
    }

    // Use a transaction to deactivate previous active year and insert the new one atomically.
    const createdRow = await this.prisma.$transaction(async (tx: any) => {
      await tx.$executeRaw`UPDATE tenant.academic_years SET is_active = false WHERE is_active = true`;
      const rows: any = await tx.$queryRaw`
        INSERT INTO tenant.academic_years (name, start_date, end_date, is_active)
        VALUES (${data.name}, ${data.startDate.toISOString().slice(0, 10)}, ${data.endDate.toISOString().slice(0, 10)}, ${isActive})
        RETURNING *
      `;
      return rows[0];
    });

    return this.mapRowToAcademicYear(createdRow);
  }

  async listAcademicYears(): Promise<AcademicYear[]> {
    if (this.hasAcademicModel) {
      return this.dbAny.academicYear.findMany({
        orderBy: { startDate: 'desc' },
      }) as Promise<AcademicYear[]>;
    }

    const rows: any = await this.dbAny
      .$queryRaw`SELECT * FROM tenant.academic_years ORDER BY start_date DESC`;
    return (rows || []).map((r: any) => this.mapRowToAcademicYear(r));
  }

  async getAcademicYear(id: string): Promise<AcademicYear> {
    if (this.hasAcademicModel) {
      const r = await (this.dbAny.academicYear.findUnique({
        where: { id },
      }) as Promise<AcademicYear | null>);
      if (!r) throw new NotFoundException('Academic year not found');
      return r;
    }

    const rows: any = await this.dbAny
      .$queryRaw`SELECT * FROM tenant.academic_years WHERE id = ${id} LIMIT 1`;
    const row = Array.isArray(rows) ? rows[0] : rows;
    if (!row) throw new NotFoundException('Academic year not found');
    return this.mapRowToAcademicYear(row);
  }

  async updateAcademicYear(
    id: string,
    data: Partial<{
      name: string;
      startDate: Date;
      endDate: Date;
      isActive: boolean;
    }>,
  ): Promise<AcademicYear> {
    if (this.hasAcademicModel) {
      if (data.isActive) {
        await this.prisma.$transaction(async (tx) => {
          const t: any = tx as any;
          await t.academicYear.updateMany({
            where: { isActive: true },
            data: { isActive: false },
          });
          return t.academicYear.update({ where: { id }, data });
        });
        return this.getAcademicYear(id);
      }
      return this.dbAny.academicYear.update({
        where: { id },
        data,
      }) as Promise<AcademicYear>;
    }

    // raw fallback
    const existsResult: any = await this.dbAny.$queryRaw`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'tenant' AND table_name = 'academic_years'
      ) as exists
    `;
    const exists = Array.isArray(existsResult)
      ? !!existsResult[0]?.exists
      : !!existsResult?.exists;
    if (!exists) {
      throw new InternalServerErrorException(
        'AcademicYear table not found in the database. Run prisma migrate and prisma generate.',
      );
    }

    if (data.isActive) {
      const updatedRow = await this.prisma.$transaction(async (tx: any) => {
        await tx.$executeRaw`UPDATE tenant.academic_years SET is_active = false WHERE is_active = true`;
        const rows: any = await tx.$queryRaw`
          UPDATE tenant.academic_years SET
            name = COALESCE(${data.name}, name),
            start_date = COALESCE(${data.startDate ? data.startDate.toISOString().slice(0, 10) : null}, start_date),
            end_date = COALESCE(${data.endDate ? data.endDate.toISOString().slice(0, 10) : null}, end_date),
            is_active = ${true}
          WHERE id = ${id}
          RETURNING *
        `;
        return rows[0];
      });
      return this.mapRowToAcademicYear(updatedRow);
    }

    const rows: any = await this.dbAny.$queryRaw`
      UPDATE tenant.academic_years SET
        name = COALESCE(${data.name ?? null}, name),
        start_date = COALESCE(${data.startDate ? data.startDate.toISOString().slice(0, 10) : null}, start_date),
        end_date = COALESCE(${data.endDate ? data.endDate.toISOString().slice(0, 10) : null}, end_date),
        is_active = COALESCE(${typeof data.isActive === 'boolean' ? data.isActive : null}, is_active)
      WHERE id = ${id}
      RETURNING *
    `;

    const row = Array.isArray(rows) ? rows[0] : rows;
    if (!row) throw new NotFoundException('Academic year not found');
    return this.mapRowToAcademicYear(row);
  }

  async deleteAcademicYear(id: string): Promise<AcademicYear> {
    // ensure exists
    await this.getAcademicYear(id);
    if (this.hasAcademicModel) {
      return this.dbAny.academicYear.delete({
        where: { id },
      }) as Promise<AcademicYear>;
    }
    const rows: any = await this.dbAny
      .$queryRaw`DELETE FROM tenant.academic_years WHERE id = ${id} RETURNING *`;
    const row = Array.isArray(rows) ? rows[0] : rows;
    return this.mapRowToAcademicYear(row);
  }

  /* ---------------- Classes ---------------- */
  async createClass(data: {
    name: string;
    academicYear?: string;
    academicYearId?: string;
    classTeacherId?: string;
  }): Promise<SchoolClass> {
    return (this.prisma as any).schoolClass.create({
      data: {
        name: data.name,
        academicYear: data.academicYear ?? '',
        academicYearId: data.academicYearId ?? null,
        classTeacherId: data.classTeacherId ?? null,
      },
    });
  }

  async listClasses(): Promise<SchoolClass[]> {
    return (this.prisma as any).schoolClass.findMany({
      include: { sections: true, academicYearRel: true },
    });
  }

  async getClass(id: string): Promise<SchoolClass> {
    const r = await (this.prisma as any).schoolClass.findUnique({
      where: { id },
      include: { sections: true, academicYearRel: true },
    });
    if (!r) throw new NotFoundException('Class not found');
    return r;
  }

  async updateClass(
    id: string,
    data: Partial<{
      name: string;
      academicYear?: string;
      academicYearId?: string;
      classTeacherId?: string;
    }>,
  ): Promise<SchoolClass> {
    await this.getClass(id);
    return (this.prisma as any).schoolClass.update({
      where: { id },
      data,
    }) as Promise<SchoolClass>;
  }

  async deleteClass(id: string): Promise<SchoolClass> {
    await this.getClass(id);
    return (this.prisma as any).schoolClass.delete({ where: { id } });
  }

  /* ---------------- Sections ---------------- */
  async createSection(data: {
    name: string;
    classId: string;
  }): Promise<Section> {
    // ensure class exists
    await this.getClass(data.classId);
    return (this.prisma as any).section.create({ data });
  }

  async listSections(classId?: string): Promise<Section[]> {
    const where = classId ? { where: { classId } } : {};
    return (this.prisma as any).section.findMany(where as any);
  }

  async getSection(id: string): Promise<Section> {
    const r = await (this.prisma as any).section.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Section not found');
    return r;
  }

  async updateSection(
    id: string,
    data: Partial<{ name: string }>,
  ): Promise<Section> {
    await this.getSection(id);
    return (this.prisma as any).section.update({
      where: { id },
      data,
    }) as Promise<Section>;
  }

  async deleteSection(id: string): Promise<Section> {
    await this.getSection(id);
    return (this.prisma as any).section.delete({ where: { id } });
  }

  /* ---------------- Subjects ---------------- */
  async createSubject(data: {
    name: string;
    code?: string;
    classId: string;
    teacherId?: string;
  }): Promise<Subject> {
    // ensure class exists
    await this.getClass(data.classId);
    return this.prisma.subject.create({ data });
  }

  async listSubjects(classId?: string): Promise<Subject[]> {
    const where = classId ? { where: { classId } } : {};
    return this.prisma.subject.findMany(where as any);
  }

  async getSubject(id: string): Promise<Subject> {
    const r = await this.prisma.subject.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Subject not found');
    return r;
  }

  async updateSubject(
    id: string,
    data: Partial<{ name: string; code?: string; teacherId?: string }>,
  ): Promise<Subject> {
    await this.getSubject(id);
    return this.prisma.subject.update({
      where: { id },
      data,
    }) as Promise<Subject>;
  }

  async deleteSubject(id: string): Promise<Subject> {
    await this.getSubject(id);
    return this.prisma.subject.delete({ where: { id } });
  }

  /* ---------------- Periods (TimetableSlot) ---------------- */
  private parseTimeToDate(value: string): Date {
    // Accepts HH:mm or HH:mm:ss
    const parts = value.split(':').map((p) => parseInt(p, 10));
    if (parts.length < 2)
      throw new Error('Invalid time format, expected HH:mm or HH:mm:ss');
    const d = new Date();
    d.setHours(parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0, 0);
    // normalize to epoch date to avoid timezone surprises
    d.setFullYear(1970, 0, 1);
    return d;
  }

  async createPeriod(data: {
    classId: string;
    subjectId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    room?: string;
    weekType?: string;
  }): Promise<TimetableSlot> {
    // ensure class and subject exist
    await this.getClass(data.classId);
    await this.getSubject(data.subjectId);

    const start = this.parseTimeToDate(data.startTime);
    const end = this.parseTimeToDate(data.endTime);

    return this.prisma.timetableSlot.create({
      data: {
        classId: data.classId,
        subjectId: data.subjectId,
        dayOfWeek: data.dayOfWeek,
        startTime: start,
        endTime: end,
        room: data.room ?? null,
        weekType: (data.weekType as any) ?? undefined,
      },
    });
  }

  async listPeriods(classId?: string): Promise<TimetableSlot[]> {
    const where = classId ? { where: { classId } } : {};
    return this.prisma.timetableSlot.findMany(where as any);
  }

  async getPeriod(id: string): Promise<TimetableSlot> {
    const r = await this.prisma.timetableSlot.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Period not found');
    return r;
  }

  async updatePeriod(
    id: string,
    data: Partial<{
      dayOfWeek?: number;
      startTime?: string;
      endTime?: string;
      room?: string;
      weekType?: string;
    }>,
  ): Promise<TimetableSlot> {
    await this.getPeriod(id);
    const updateData: any = { ...data };
    if (data.startTime)
      updateData.startTime = this.parseTimeToDate(data.startTime);
    if (data.endTime) updateData.endTime = this.parseTimeToDate(data.endTime);
    return this.prisma.timetableSlot.update({
      where: { id },
      data: updateData,
    }) as Promise<TimetableSlot>;
  }

  async deletePeriod(id: string): Promise<TimetableSlot> {
    await this.getPeriod(id);
    return this.prisma.timetableSlot.delete({ where: { id } });
  }

  /* ---------------- Holidays ---------------- */
  async createHoliday(data: {
    name: string;
    date: Date;
    description?: string;
    isRecurring?: boolean;
  }): Promise<Holiday> {
    return (this.prisma as any).holiday.create({ data });
  }

  async listHolidays(): Promise<Holiday[]> {
    return (this.prisma as any).holiday.findMany({ orderBy: { date: 'asc' } });
  }

  async getHoliday(id: string): Promise<Holiday> {
    const r = await (this.prisma as any).holiday.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Holiday not found');
    return r;
  }

  async updateHoliday(
    id: string,
    data: Partial<{
      name?: string;
      date?: Date;
      description?: string;
      isRecurring?: boolean;
    }>,
  ): Promise<Holiday> {
    await this.getHoliday(id);
    return (this.prisma as any).holiday.update({
      where: { id },
      data,
    }) as Promise<Holiday>;
  }

  async deleteHoliday(id: string): Promise<Holiday> {
    await this.getHoliday(id);
    return (this.prisma as any).holiday.delete({ where: { id } });
  }
}
