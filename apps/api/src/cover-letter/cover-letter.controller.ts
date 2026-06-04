import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CoverLetterService } from './cover-letter.service';

@UseGuards(JwtAuthGuard)
@Controller('cover-letter')
export class CoverLetterController {
  constructor(private readonly coverLetters: CoverLetterService) {}

  @Post('generate')
  generate(@Req() req: any, @Body() body: unknown) {
    return this.coverLetters.generate(req.user.id, body);
  }
}

