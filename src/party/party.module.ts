import { Module } from '@nestjs/common';
import { PartyService } from './party.service';
import { PartyController } from './party.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [PartyController],
  providers: [PartyService, PrismaService],
})
export class PartyModule {}
