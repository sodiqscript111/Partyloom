import { IsNotEmpty, IsNumber, IsEmail, IsString, IsOptional, IsUUID, Min } from 'class-validator';

export class InitializePaymentDto {
    @IsNotEmpty()
    @IsNumber()
    @Min(100)
    amount: number;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsUUID()
    userId: string;

    @IsNotEmpty()
    @IsUUID()
    partyId: string;

    @IsNotEmpty()
    @IsString()
    idempotencyKey: string;

    @IsOptional()
    @IsString()
    callbackUrl?: string;

    @IsOptional()
    metadata?: Record<string, any>;
}

export class VerifyPaymentDto {
    @IsNotEmpty()
    @IsString()
    reference: string;
}
