import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PartyModule } from './party/party.module';
import { UserModule } from './user/user.module';
import { AiSummaryModule } from './ai_summary/ai_summary.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule,
    AuthModule,
    PartyModule,
    PrismaModule,
    UserModule,
    AiSummaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
