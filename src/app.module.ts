import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PartyModule } from './party/party.module';

@Module({
  imports: [PartyModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
