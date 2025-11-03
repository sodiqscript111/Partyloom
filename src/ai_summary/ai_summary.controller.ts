// ai_summary.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AiSummaryService } from './ai_summary.service';

@Controller('ai-summary')
export class AiSummaryController {
  constructor(private readonly aiSummaryService: AiSummaryService) {}

  @Post()
  async create(@Body() data: { text: string }) {
    return this.aiSummaryService.summarize(data.text);
  }
}
