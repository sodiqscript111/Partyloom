import { Module } from '@nestjs/common';
import { AiSummaryService } from './ai_summary.service';
import { AiSummaryController } from './ai_summary.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AiSummaryService],
  controllers: [AiSummaryController]
})
export class AiSummaryModule { }
