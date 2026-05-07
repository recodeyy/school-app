import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

/**
 * Enforces per-role, per-module AI usage limits.
 *
 * Reads limits from `AiCreditAllocation` and counts usage
 * from `AiUsageLog` for the current day / month.
 */
@Injectable()
export class AiCreditService {
  private readonly logger = new Logger(AiCreditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check whether the user is within their daily/monthly limits.
   * Throws 429 if limit exceeded.
   */
  async enforceLimit(
    userId: string,
    userRole: string,
    module: string,
  ): Promise<void> {
    // Look for a specific allocation first, then a wildcard ('*') one
    let allocation = await this.prisma.aiCreditAllocation.findUnique({
      where: { role_module: { role: userRole as any, module } },
    });

    if (!allocation || !allocation.isActive) {
      allocation = await this.prisma.aiCreditAllocation.findUnique({
        where: { role_module: { role: userRole as any, module: '*' } },
      });
    }

    // No allocation configured → allow (no limits set yet)
    if (!allocation || !allocation.isActive) {
      return;
    }

    const now = new Date();

    // Daily count
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const dailyCount = await this.prisma.aiUsageLog.count({
      where: {
        userId,
        module,
        createdAt: { gte: startOfDay },
      },
    });

    if (dailyCount >= allocation.dailyLimit) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Daily AI usage limit reached for module "${module}". Limit: ${allocation.dailyLimit}. Try again tomorrow.`,
          retryAfter: 'tomorrow',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Monthly count
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyCount = await this.prisma.aiUsageLog.count({
      where: {
        userId,
        module,
        createdAt: { gte: startOfMonth },
      },
    });

    if (monthlyCount >= allocation.monthlyLimit) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Monthly AI usage limit reached for module "${module}". Limit: ${allocation.monthlyLimit}. Try again next month.`,
          retryAfter: 'next month',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
