import { Injectable } from '@nestjs/common';
import { ChatAnthropic } from '@langchain/anthropic';
import { createAgent, tool } from 'langchain';
import * as z from 'zod';

@Injectable()
export class AiSummaryService {
  private agent;
  constructor() {
    const model = new ChatAnthropic({ model: 'claude-3-5-sonnet-20241022' });
    const summarizeTool = tool(
      async ({ text }) => `Summary: ${text.substring(0, 100)}...`,
      {
        name: 'summarize_text',
        description: 'Summarize given text',
        schema: z.object({ text: z.string() }),
      }
    );
    this.agent = createAgent({ model, tools: [summarizeTool] });
  }
  async summarize(text: string): Promise<string> {
    const response = await this.agent.invoke({
      messages: [{ role: 'user', content: `Summarize: ${text}` }],
    });
    return response.messages[response.messages.length - 1].content;
  }
}