import { Module } from '@nestjs/common';
import { AiSummaryService } from './ai_summary.service';
import { AiSummaryController } from './ai_summary.controller';

@Module({
  providers: [AiSummaryService],
  controllers: [AiSummaryController]
})
export class AiSummaryModule {}
