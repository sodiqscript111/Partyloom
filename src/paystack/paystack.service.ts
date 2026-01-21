import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { InitializePaymentDto } from './dto/paystack.dto';
import { randomBytes } from 'crypto';

interface PaystackInitResponse {
    status: boolean;
    message: string;
    data: {
        authorization_url: string;
        access_code: string;
        reference: string;
    };
}

interface PaystackVerifyResponse {
    status: boolean;
    message: string;
    data: {
        status: string;
        reference: string;
        amount: number;
        gateway_response: string;
        paid_at: string;
        channel: string;
        currency: string;
        customer: {
            email: string;
        };
    };
}

@Injectable()
export class PaystackService {
    private readonly paystackBaseUrl = 'https://api.paystack.co';
    private readonly secretKey: string;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {
        this.secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY') || '';
    }

    async initializePayment(dto: InitializePaymentDto) {
        const existingPayment = await this.getPaymentByIdempotencyKey(dto.idempotencyKey);
        if (existingPayment) {
            return {
                message: 'Payment already exists for this idempotency key',
                payment: existingPayment,
                isExisting: true,
            };
        }

        const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        const party = await this.prisma.party.findUnique({ where: { id: dto.partyId } });
        if (!party) {
            throw new HttpException('Party not found', HttpStatus.NOT_FOUND);
        }

        const reference = `pay_${randomBytes(12).toString('hex')}`;

        const metadata = {
            userId: dto.userId,
            partyId: dto.partyId,
            userName: user.name,
            partyName: party.name,
            ...dto.metadata,
        };

        const paystackPayload = {
            email: dto.email,
            amount: dto.amount * 100,
            reference,
            callback_url: dto.callbackUrl,
            metadata,
        };

        const response = await fetch(`${this.paystackBaseUrl}/transaction/initialize`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.secretKey}`,
                'Content-Type': 'application/json',
                'Idempotency-Key': dto.idempotencyKey,
            },
            body: JSON.stringify(paystackPayload),
        });

        const result: PaystackInitResponse = await response.json();

        if (!result.status) {
            throw new HttpException(result.message || 'Failed to initialize payment', HttpStatus.BAD_REQUEST);
        }

        const payment = await this.prisma.payment.create({
            data: {
                reference,
                idempotencyKey: dto.idempotencyKey,
                amount: dto.amount,
                email: dto.email,
                userId: dto.userId,
                partyId: dto.partyId,
                callbackUrl: dto.callbackUrl,
                metadata,
                status: 'pending',
            },
        });

        return {
            message: 'Payment initialized successfully',
            payment,
            authorization_url: result.data.authorization_url,
            access_code: result.data.access_code,
            isExisting: false,
        };
    }

    async verifyPayment(reference: string) {
        const response = await fetch(`${this.paystackBaseUrl}/transaction/verify/${reference}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.secretKey}`,
                'Content-Type': 'application/json',
            },
        });

        const result: PaystackVerifyResponse = await response.json();

        if (!result.status) {
            throw new HttpException(result.message || 'Failed to verify payment', HttpStatus.BAD_REQUEST);
        }

        const payment = await this.prisma.payment.findUnique({
            where: { reference },
        });

        if (!payment) {
            throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
        }

        if (result.data.status === 'success' && payment.status !== 'success') {
            const updatedPayment = await this.prisma.$transaction(async (tx) => {
                const contribution = await tx.contribution.create({
                    data: {
                        amount: payment.amount,
                        userId: payment.userId,
                        partyId: payment.partyId,
                    },
                });

                return tx.payment.update({
                    where: { id: payment.id },
                    data: {
                        status: 'success',
                        paystackRef: result.data.reference,
                        contributionId: contribution.id,
                    },
                    include: { contribution: true },
                });
            });

            return {
                message: 'Payment verified successfully',
                payment: updatedPayment,
                paystackData: result.data,
            };
        }

        if (result.data.status === 'failed' && payment.status !== 'failed') {
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'failed' },
            });
        }

        return {
            message: 'Payment verification complete',
            payment: await this.prisma.payment.findUnique({ where: { id: payment.id } }),
            paystackData: result.data,
        };
    }

    async handleWebhook(payload: any) {
        const event = payload.event;
        const data = payload.data;

        if (event === 'charge.success') {
            const payment = await this.prisma.payment.findUnique({
                where: { reference: data.reference },
            });

            if (payment && payment.status !== 'success') {
                await this.prisma.$transaction(async (tx) => {
                    const contribution = await tx.contribution.create({
                        data: {
                            amount: payment.amount,
                            userId: payment.userId,
                            partyId: payment.partyId,
                        },
                    });

                    await tx.payment.update({
                        where: { id: payment.id },
                        data: {
                            status: 'success',
                            paystackRef: data.reference,
                            contributionId: contribution.id,
                        },
                    });
                });

                return { message: 'Webhook processed successfully' };
            }
        }

        return { message: 'Webhook received' };
    }

    async getPaymentByIdempotencyKey(idempotencyKey: string) {
        return this.prisma.payment.findUnique({
            where: { idempotencyKey },
        });
    }

    async getPaymentByReference(reference: string) {
        return this.prisma.payment.findUnique({
            where: { reference },
            include: { contribution: true, user: true, party: true },
        });
    }

    async getUserPayments(userId: string) {
        return this.prisma.payment.findMany({
            where: { userId },
            include: { party: true, contribution: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getPartyPayments(partyId: string) {
        return this.prisma.payment.findMany({
            where: { partyId },
            include: { user: true, contribution: true },
            orderBy: { createdAt: 'desc' },
        });
    }
}
