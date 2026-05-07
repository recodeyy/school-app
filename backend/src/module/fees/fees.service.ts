import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FeeStatus } from '../../generated/prisma/client.js';
import { parsePagination } from '../../common/index.js';
import { NotificationCoreService } from '../../core/notifications/index.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateFeeDto, QueryFeesDto, RecordPaymentDto } from './dto/index.js';

@Injectable()
export class FeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationCoreService,
  ) {}

  /**
   * Create a fee entry for a student.
   */
  async create(dto: CreateFeeDto) {
    const student = await this.prisma.user.findUnique({
      where: { id: dto.studentId },
    });
    if (!student) throw new NotFoundException('Student not found');

    const fee = await this.prisma.fee.create({
      data: {
        studentId: dto.studentId,
        title: dto.title,
        description: dto.description,
        amount: dto.amount,
        dueDate: new Date(dto.dueDate),
        status: FeeStatus.PENDING,
        paidAmount: 0,
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
      },
    });

    // Notify student and parent
    await this.notificationService.create({
      recipientId: dto.studentId,
      type: 'FEE_CREATED',
      title: `New Fee: ${dto.title}`,
      body: `Amount: ₹${dto.amount}, Due: ${dto.dueDate}`,
      data: { feeId: fee.id },
    });

    await this.notificationService.notifyGuardians(
      [dto.studentId],
      'FEE_CREATED',
      `New Fee: ${dto.title}`,
      `Amount: ₹${dto.amount}, Due: ${dto.dueDate}`,
      { feeId: fee.id },
    );

    return fee;
  }

  /**
   * Record a payment against a fee.
   */
  async recordPayment(
    feeId: string,
    dto: RecordPaymentDto,
    recordedById: string,
  ) {
    const fee = await this.prisma.fee.findUnique({ where: { id: feeId } });
    if (!fee) throw new NotFoundException('Fee not found');

    const newPaidAmount = Number(fee.paidAmount) + dto.amount;
    if (newPaidAmount > Number(fee.amount)) {
      throw new BadRequestException('Payment amount exceeds remaining balance');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const payment = await tx.feePayment.create({
        data: {
          feeId,
          amount: dto.amount,
          paymentMethod: dto.paymentMethod,
          transactionId: dto.transactionId,
          recordedById,
        },
      });

      const newStatus =
        newPaidAmount >= Number(fee.amount)
          ? FeeStatus.PAID
          : FeeStatus.PARTIAL;

      await tx.fee.update({
        where: { id: feeId },
        data: { paidAmount: newPaidAmount, status: newStatus },
      });

      return payment;
    });

    // Notify student about payment
    await this.notificationService.create({
      recipientId: fee.studentId,
      type: 'FEE_PAYMENT',
      title: `Payment Received: ${fee.title}`,
      body: `₹${dto.amount} received. Remaining: ₹${Number(fee.amount) - newPaidAmount}`,
      data: { feeId, paymentId: result.id },
    });

    return result;
  }

  /**
   * List fees with filtering.
   */
  async list(query: QueryFeesDto) {
    const { page, limit, skip } = parsePagination(query);
    const where: any = {};

    if (query.studentId) where.studentId = query.studentId;
    if (query.status) where.status = query.status as FeeStatus;

    const [data, total] = await Promise.all([
      this.prisma.fee.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dueDate: 'desc' },
        include: {
          student: { select: { id: true, name: true, email: true } },
          payments: true,
        },
      }),
      this.prisma.fee.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get fee details.
   */
  async getById(id: string) {
    const fee = await this.prisma.fee.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, name: true, email: true } },
        payments: {
          include: {
            recordedBy: { select: { id: true, name: true } },
          },
          orderBy: { paidAt: 'desc' },
        },
      },
    });
    if (!fee) throw new NotFoundException('Fee not found');
    return fee;
  }

  /**
   * Get fee summary for a student.
   */
  async getStudentFeeSummary(studentId: string) {
    const fees = await this.prisma.fee.findMany({
      where: { studentId },
    });

    const totalAmount = fees.reduce((acc, f) => acc + Number(f.amount), 0);
    const paidAmount = fees.reduce((acc, f) => acc + Number(f.paidAmount), 0);
    const pendingAmount = totalAmount - paidAmount;
    const pendingCount = fees.filter(
      (f) => f.status !== FeeStatus.PAID && f.status !== FeeStatus.WAIVED,
    ).length;
    const overdueCount = fees.filter(
      (f) => f.status === FeeStatus.OVERDUE,
    ).length;

    return {
      totalAmount,
      paidAmount,
      pendingAmount,
      totalFees: fees.length,
      pendingCount,
      overdueCount,
    };
  }
}
