import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { GenerateNoticeDto } from '../dto/notice.dto.js';
import { GenerateParentMessageDto } from '../dto/parent-message.dto.js';
import { NoticeGeneratorService } from '../services/notice-generator.service.js';
import { ParentMessageService } from '../services/parent-message.service.js';

@ApiTags('ai-admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ai/admin')
export class AiAdminController {
  constructor(
    private readonly noticeService: NoticeGeneratorService,
    private readonly parentMessageService: ParentMessageService,
  ) {}

  /* ------------------------------------------------------------------ */
  /*  Notice Generator                                                   */
  /* ------------------------------------------------------------------ */
  @Post('notice')
  @Roles('ADMIN', 'PRINCIPAL', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Generate school notice/circular using AI',
    description:
      'Creates polished circulars in English/Hindi/Marathi for any audience.',
  })
  @ApiBody({ type: GenerateNoticeDto })
  @ApiOkResponse({
    description: 'Generated notice in JSON',
    schema: {
      example: {
        subject: 'Annual Sports Day - 15th November 2026',
        date: '6th May 2026',
        to: 'All Parents and Guardians',
        body: 'We are pleased to inform you...',
        closingLine: 'We look forward to your presence.',
        signedBy: 'The Principal',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiTooManyRequestsResponse({ description: 'AI usage limit exceeded' })
  async generateNotice(
    @Body() dto: GenerateNoticeDto,
    @Request() req: any,
  ) {
    return this.noticeService.generate(dto, req.user.sub, req.user.role);
  }

  /* ------------------------------------------------------------------ */
  /*  Parent Message Writer                                              */
  /* ------------------------------------------------------------------ */
  @Post('parent-message')
  @Roles('TEACHER', 'ADMIN', 'PRINCIPAL', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Generate parent message using AI',
    description:
      'Creates a polite parent message based on issue/reason (attendance, behavior, fees, academic).',
  })
  @ApiBody({ type: GenerateParentMessageDto })
  @ApiOkResponse({
    description: 'Generated parent message in JSON',
    schema: {
      example: {
        greeting: 'Dear Mr. Doe,',
        body: 'I hope this message finds you well...',
        actionRequired:
          'Please ensure regular attendance going forward.',
        closing: 'Thank you for your cooperation.',
        senderPlaceholder: 'Class Teacher, 10-A',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiTooManyRequestsResponse({ description: 'AI usage limit exceeded' })
  async generateParentMessage(
    @Body() dto: GenerateParentMessageDto,
    @Request() req: any,
  ) {
    return this.parentMessageService.generate(
      dto,
      req.user.sub,
      req.user.role,
    );
  }
}
