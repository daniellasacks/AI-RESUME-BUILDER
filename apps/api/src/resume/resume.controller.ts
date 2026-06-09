import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { parseOrBadRequest } from '../common/zod';
import { ResumeExtractRequestSchema } from './resume.schemas';
import { ResumeExtractService } from './resume-extract.service';
import { ResumeCrudService } from './resume-crud.service';

@UseGuards(JwtAuthGuard)
@Controller('resume')
export class ResumeController {
  constructor(
    private readonly extractor: ResumeExtractService,
    private readonly crud: ResumeCrudService,
  ) {}

  @Post('extract')
  extract(@Req() req: any, @Body() body: unknown) {
    const parsed = parseOrBadRequest(ResumeExtractRequestSchema, body);
    return this.extractor.extractFromUploadedDocument({
      userId: req.user.id,
      documentId: parsed.documentId,
    });
  }

  @Get()
  list(@Req() req: any) {
    return this.crud.listResumes(req.user.id);
  }

  @Post()
  create(@Req() req: any, @Body() body: unknown) {
    return this.crud.createResume(req.user.id, body);
  }

  @Get(':id')
  get(@Req() req: any, @Param('id') id: string) {
    return this.crud.getResume(req.user.id, id);
  }

  @Post('versions')
  createVersion(@Req() req: any, @Body() body: unknown) {
    return this.crud.createVersion(req.user.id, body);
  }

  @Post('tailor')
  tailor(@Req() req: any, @Body() body: unknown) {
    return this.crud.tailorVersion(req.user.id, body);
  }

  @Post('generate')
  generate(@Req() req: any, @Body() body: unknown) {
    return this.crud.generateFromWizard(req.user.id, body);
  }

  @Post('improve')
  improve(@Req() req: any, @Body() body: unknown) {
    return this.crud.improveVersion(req.user.id, body);
  }
}

