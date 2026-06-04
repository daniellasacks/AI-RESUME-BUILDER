import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JobTargetsService } from './job-targets.service';

@UseGuards(JwtAuthGuard)
@Controller('job-targets')
export class JobTargetsController {
  constructor(private readonly jobTargets: JobTargetsService) {}

  @Get()
  list(@Req() req: any) {
    return this.jobTargets.list(req.user.id);
  }

  @Post()
  create(@Req() req: any, @Body() body: unknown) {
    return this.jobTargets.create(req.user.id, body);
  }

  @Get(':id')
  get(@Req() req: any, @Param('id') id: string) {
    return this.jobTargets.get(req.user.id, id);
  }

  @Put(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: unknown) {
    return this.jobTargets.update(req.user.id, id, body);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.jobTargets.remove(req.user.id, id);
  }
}

