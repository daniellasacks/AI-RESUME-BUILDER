import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { CoverLetterController } from './cover-letter.controller';
import { CoverLetterService } from './cover-letter.service';

@Module({
  imports: [AiModule],
  controllers: [CoverLetterController],
  providers: [CoverLetterService],
})
export class CoverLetterModule {}

