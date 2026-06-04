import { Controller, Get, Param, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExportService } from './export.service';

@UseGuards(JwtAuthGuard)
@Controller('export')
export class ExportController {
  constructor(private readonly exporter: ExportService) {}

  @Get('resume/:versionId.pdf')
  async pdf(@Req() req: any, @Param('versionId') versionId: string, @Res() res: Response) {
    const out = await this.exporter.exportPdf({ userId: req.user.id, resumeVersionId: versionId });
    res.setHeader('content-type', 'application/pdf');
    res.setHeader('content-disposition', `attachment; filename="${out.filename}"`);
    res.send(out.buffer);
  }

  @Get('resume/:versionId.docx')
  async docx(@Req() req: any, @Param('versionId') versionId: string, @Res() res: Response) {
    const out = await this.exporter.exportDocx({ userId: req.user.id, resumeVersionId: versionId });
    res.setHeader(
      'content-type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    res.setHeader('content-disposition', `attachment; filename="${out.filename}"`);
    res.send(out.buffer);
  }
}

