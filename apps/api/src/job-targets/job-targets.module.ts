import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { JobTargetsController } from './job-targets.controller';
import { JobTargetsService } from './job-targets.service';

@Module({
  imports: [PrismaModule],
  controllers: [JobTargetsController],
  providers: [JobTargetsService],
  exports: [JobTargetsService],
})
export class JobTargetsModule {}

