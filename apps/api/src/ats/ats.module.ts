import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { AtsController } from './ats.controller';
import { AtsService } from './ats.service';

@Module({
  imports: [AiModule],
  controllers: [AtsController],
  providers: [AtsService],
})
export class AtsModule {}

