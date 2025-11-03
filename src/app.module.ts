import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PartyModule } from './party/party.module';
import { UserModule } from './user/user.module';
import { AiSummaryService } from './ai_summary/ai_summary.service';
import { AiSummaryController } from './ai_summary/ai_summary.controller';
import { AiSummaryModule } from './ai_summary/ai_summary.module';

@Module({
  imports: [PartyModule, PrismaModule, UserModule, AiSummaryModule],
  controllers: [AppController, AiSummaryController],
  providers: [AppService, AiSummaryService],
})
export class AppModule {}
