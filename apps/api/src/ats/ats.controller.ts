import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { parseOrBadRequest } from '../common/zod';
import { AtsService } from './ats.service';

const EvaluateSchema = z.object({
  resumeVersionId: z.string().min(1),
  jobTargetId: z.string().min(1),
});

@UseGuards(JwtAuthGuard)
@Controller('ats')
export class AtsController {
  constructor(private readonly ats: AtsService) {}

  @Post('evaluate')
  evaluate(@Req() req: any, @Body() body: unknown) {
    const data = parseOrBadRequest(EvaluateSchema, body);
    return this.ats.evaluate({
      userId: req.user.id,
      resumeVersionId: data.resumeVersionId,
      jobTargetId: data.jobTargetId,
    });
  }
}

