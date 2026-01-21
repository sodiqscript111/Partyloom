import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PaystackService } from './paystack.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('PaystackService', () => {
    let service: PaystackService;
    let prismaService: PrismaService;

    const mockPrismaService = {
        user: {
            findUnique: jest.fn(),
        },
        party: {
            findUnique: jest.fn(),
        },
        payment: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
        },
        contribution: {
            create: jest.fn(),
        },
        $transaction: jest.fn((callback) => callback(mockPrismaService)),
    };

    const mockConfigService = {
        get: jest.fn().mockReturnValue('sk_test_mock_key'),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaystackService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        service = module.get<PaystackService>(PaystackService);
        prismaService = module.get<PrismaService>(PrismaService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getPaymentByIdempotencyKey', () => {
        it('should return payment if idempotency key exists', async () => {
            const mockPayment = {
                id: 'payment-id',
                idempotencyKey: 'test-key-123',
                reference: 'pay_abc123',
                amount: 5000,
                status: 'pending',
            };

            mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);

            const result = await service.getPaymentByIdempotencyKey('test-key-123');

            expect(result).toEqual(mockPayment);
            expect(mockPrismaService.payment.findUnique).toHaveBeenCalledWith({
                where: { idempotencyKey: 'test-key-123' },
            });
        });

        it('should return null if idempotency key does not exist', async () => {
            mockPrismaService.payment.findUnique.mockResolvedValue(null);

            const result = await service.getPaymentByIdempotencyKey('non-existent-key');

            expect(result).toBeNull();
        });
    });

    describe('initializePayment', () => {
        const mockUser = { id: 'user-id', name: 'Test User', email: 'test@example.com' };
        const mockParty = { id: 'party-id', name: 'Test Party' };
        const mockDto = {
            amount: 5000,
            email: 'test@example.com',
            userId: 'user-id',
            partyId: 'party-id',
            idempotencyKey: 'unique-key-123',
            callbackUrl: 'https://example.com/callback',
        };

        it('should return existing payment if idempotency key exists', async () => {
            const existingPayment = {
                id: 'existing-payment-id',
                idempotencyKey: mockDto.idempotencyKey,
                reference: 'pay_existing',
                amount: 5000,
                status: 'pending',
            };

            mockPrismaService.payment.findUnique.mockResolvedValue(existingPayment);

            const result = await service.initializePayment(mockDto);

            expect(result.isExisting).toBe(true);
            expect(result.payment).toEqual(existingPayment);
            expect(result.message).toBe('Payment already exists for this idempotency key');
        });

        it('should throw error if user not found', async () => {
            mockPrismaService.payment.findUnique.mockResolvedValue(null);
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            await expect(service.initializePayment(mockDto)).rejects.toThrow('User not found');
        });

        it('should throw error if party not found', async () => {
            mockPrismaService.payment.findUnique.mockResolvedValue(null);
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockPrismaService.party.findUnique.mockResolvedValue(null);

            await expect(service.initializePayment(mockDto)).rejects.toThrow('Party not found');
        });
    });

    describe('getUserPayments', () => {
        it('should return payments for a user', async () => {
            const mockPayments = [
                { id: 'payment-1', amount: 5000, status: 'success' },
                { id: 'payment-2', amount: 3000, status: 'pending' },
            ];

            mockPrismaService.payment.findMany.mockResolvedValue(mockPayments);

            const result = await service.getUserPayments('user-id');

            expect(result).toEqual(mockPayments);
            expect(mockPrismaService.payment.findMany).toHaveBeenCalledWith({
                where: { userId: 'user-id' },
                include: { party: true, contribution: true },
                orderBy: { createdAt: 'desc' },
            });
        });
    });

    describe('getPartyPayments', () => {
        it('should return payments for a party', async () => {
            const mockPayments = [
                { id: 'payment-1', amount: 5000, status: 'success' },
            ];

            mockPrismaService.payment.findMany.mockResolvedValue(mockPayments);

            const result = await service.getPartyPayments('party-id');

            expect(result).toEqual(mockPayments);
            expect(mockPrismaService.payment.findMany).toHaveBeenCalledWith({
                where: { partyId: 'party-id' },
                include: { user: true, contribution: true },
                orderBy: { createdAt: 'desc' },
            });
        });
    });

    describe('handleWebhook', () => {
        it('should process charge.success event and create contribution', async () => {
            const mockPayment = {
                id: 'payment-id',
                reference: 'pay_abc123',
                amount: 5000,
                userId: 'user-id',
                partyId: 'party-id',
                status: 'pending',
            };

            const mockContribution = {
                id: 'contribution-id',
                amount: 5000,
                userId: 'user-id',
                partyId: 'party-id',
            };

            mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);
            mockPrismaService.contribution.create.mockResolvedValue(mockContribution);
            mockPrismaService.payment.update.mockResolvedValue({
                ...mockPayment,
                status: 'success',
                contributionId: mockContribution.id,
            });

            const result = await service.handleWebhook({
                event: 'charge.success',
                data: { reference: 'pay_abc123' },
            });

            expect(result.message).toBe('Webhook processed successfully');
        });

        it('should return webhook received for unknown events', async () => {
            const result = await service.handleWebhook({
                event: 'unknown.event',
                data: {},
            });

            expect(result.message).toBe('Webhook received');
        });
    });
});
