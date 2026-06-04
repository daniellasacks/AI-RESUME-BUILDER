import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConversationsModule } from './conversations/conversations.module';
import { UploadsModule } from './uploads/uploads.module';
import { AiModule } from './ai/ai.module';
import { ResumeModule } from './resume/resume.module';
import { AtsModule } from './ats/ats.module';
import { CoverLetterModule } from './cover-letter/cover-letter.module';
import { ExportModule } from './export/export.module';
import { TemplatesModule } from './templates/templates.module';
import { JobTargetsModule } from './job-targets/job-targets.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ConversationsModule,
    UploadsModule,
    AiModule,
    ResumeModule,
    AtsModule,
    CoverLetterModule,
    ExportModule,
    TemplatesModule,
    JobTargetsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
