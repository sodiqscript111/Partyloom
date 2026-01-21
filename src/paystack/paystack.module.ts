import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaystackService } from './paystack.service';
import { PaystackController } from './paystack.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule, ConfigModule],
    controllers: [PaystackController],
    providers: [PaystackService],
    exports: [PaystackService],
})
export class PaystackModule { }
