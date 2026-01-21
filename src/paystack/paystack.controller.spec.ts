import { Test, TestingModule } from '@nestjs/testing';
import { PaystackController } from './paystack.controller';
import { PaystackService } from './paystack.service';

describe('PaystackController', () => {
    let controller: PaystackController;
    let service: PaystackService;

    const mockPaystackService = {
        initializePayment: jest.fn(),
        verifyPayment: jest.fn(),
        handleWebhook: jest.fn(),
        getPaymentByReference: jest.fn(),
        getUserPayments: jest.fn(),
        getPartyPayments: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PaystackController],
            providers: [
                {
                    provide: PaystackService,
                    useValue: mockPaystackService,
                },
            ],
        }).compile();

        controller = module.get<PaystackController>(PaystackController);
        service = module.get<PaystackService>(PaystackService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('initializePayment', () => {
        it('should initialize payment', async () => {
            const dto = {
                amount: 5000,
                email: 'test@example.com',
                userId: 'user-id',
                partyId: 'party-id',
                idempotencyKey: 'unique-key-123',
            };

            const expectedResult = {
                message: 'Payment initialized successfully',
                payment: { id: 'payment-id' },
                authorization_url: 'https://checkout.paystack.com/xxx',
                isExisting: false,
            };

            mockPaystackService.initializePayment.mockResolvedValue(expectedResult);

            const result = await controller.initializePayment(dto);

            expect(result).toEqual(expectedResult);
            expect(mockPaystackService.initializePayment).toHaveBeenCalledWith(dto);
        });
    });

    describe('verifyPayment', () => {
        it('should verify payment', async () => {
            const expectedResult = {
                message: 'Payment verified successfully',
                payment: { id: 'payment-id', status: 'success' },
            };

            mockPaystackService.verifyPayment.mockResolvedValue(expectedResult);

            const result = await controller.verifyPayment('pay_abc123');

            expect(result).toEqual(expectedResult);
            expect(mockPaystackService.verifyPayment).toHaveBeenCalledWith('pay_abc123');
        });
    });

    describe('handleWebhook', () => {
        it('should handle webhook', async () => {
            const payload = {
                event: 'charge.success',
                data: { reference: 'pay_abc123' },
            };

            const expectedResult = { message: 'Webhook processed successfully' };

            mockPaystackService.handleWebhook.mockResolvedValue(expectedResult);

            const result = await controller.handleWebhook(payload, 'signature');

            expect(result).toEqual(expectedResult);
            expect(mockPaystackService.handleWebhook).toHaveBeenCalledWith(payload);
        });
    });

    describe('getUserPayments', () => {
        it('should get user payments', async () => {
            const expectedPayments = [{ id: 'payment-1' }, { id: 'payment-2' }];

            mockPaystackService.getUserPayments.mockResolvedValue(expectedPayments);

            const result = await controller.getUserPayments('user-id');

            expect(result).toEqual(expectedPayments);
            expect(mockPaystackService.getUserPayments).toHaveBeenCalledWith('user-id');
        });
    });

    describe('getPartyPayments', () => {
        it('should get party payments', async () => {
            const expectedPayments = [{ id: 'payment-1' }];

            mockPaystackService.getPartyPayments.mockResolvedValue(expectedPayments);

            const result = await controller.getPartyPayments('party-id');

            expect(result).toEqual(expectedPayments);
            expect(mockPaystackService.getPartyPayments).toHaveBeenCalledWith('party-id');
        });
    });
});
