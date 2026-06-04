import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { ResumeController } from './resume.controller';
import { ResumeExtractService } from './resume-extract.service';
import { ResumeCrudService } from './resume-crud.service';

@Module({
  imports: [AiModule],
  controllers: [ResumeController],
  providers: [ResumeExtractService, ResumeCrudService],
})
export class ResumeModule {}

