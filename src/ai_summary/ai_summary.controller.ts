// ai_summary.controller.ts
import { Controller, Post, Body, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { AiSummaryService } from './ai_summary.service';

@Controller('ai-summary')
export class AiSummaryController {
  constructor(private readonly aiSummaryService: AiSummaryService) { }

  @Post()
  async summarizeText(@Body() data: { text: string }) {
    return { summary: await this.aiSummaryService.summarizeText(data.text) };
  }

  @Get('party/:id')
  async summarizeParty(@Param('id') id: string) {
    try {
      return await this.aiSummaryService.summarizeParty(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('party/:id/motivation')
  async getPartyMotivation(@Param('id') id: string) {
    try {
      const motivation = await this.aiSummaryService.getPartyMotivation(id);
      return { motivation };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
