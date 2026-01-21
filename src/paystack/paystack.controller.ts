import { Controller, Post, Get, Body, Param, Headers, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { PaystackService } from './paystack.service';
import { InitializePaymentDto } from './dto/paystack.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('paystack')
export class PaystackController {
    constructor(private readonly paystackService: PaystackService) { }

    @UseGuards(JwtAuthGuard)
    @Post('initialize')
    async initializePayment(@Body() dto: InitializePaymentDto) {
        return this.paystackService.initializePayment(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('verify/:reference')
    async verifyPayment(@Param('reference') reference: string) {
        return this.paystackService.verifyPayment(reference);
    }

    @Post('webhook')
    @HttpCode(HttpStatus.OK)
    async handleWebhook(
        @Body() payload: any,
        @Headers('x-paystack-signature') signature: string,
    ) {
        return this.paystackService.handleWebhook(payload);
    }

    @UseGuards(JwtAuthGuard)
    @Get('payment/:reference')
    async getPayment(@Param('reference') reference: string) {
        return this.paystackService.getPaymentByReference(reference);
    }

    @UseGuards(JwtAuthGuard)
    @Get('user/:userId/payments')
    async getUserPayments(@Param('userId') userId: string) {
        return this.paystackService.getUserPayments(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('party/:partyId/payments')
    async getPartyPayments(@Param('partyId') partyId: string) {
        return this.paystackService.getPartyPayments(partyId);
    }
}
