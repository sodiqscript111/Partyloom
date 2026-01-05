import { IsString, IsNotEmpty, IsOptional, IsDateString, IsNumber, IsBoolean, Min, MaxLength, MinLength, IsUUID } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { IsFutureDate } from '../../common/validators/custom-validators';

export class CreatePartyDto {
    @IsString()
    @IsNotEmpty({ message: 'Party name is required' })
    @MinLength(3, { message: 'Party name must be at least 3 characters' })
    @MaxLength(200, { message: 'Party name must not exceed 200 characters' })
    @Transform(({ value }) => value?.trim())
    name: string;

    @IsString()
    @IsOptional()
    @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
    @Transform(({ value }) => value?.trim())
    description?: string;

    @IsDateString({}, { message: 'Please provide a valid date' })
    @IsNotEmpty({ message: 'Date is required' })
    @IsFutureDate()
    date: string;

    @IsNumber()
    @Min(0, { message: 'Total amount must be positive' })
    @Type(() => Number)
    totalAmount: number;

    @IsBoolean()
    @IsOptional()
    divideEqually?: boolean;
}

export class UpdatePartyDto {
    @IsString()
    @IsOptional()
    @MinLength(3, { message: 'Party name must be at least 3 characters' })
    @MaxLength(200, { message: 'Party name must not exceed 200 characters' })
    @Transform(({ value }) => value?.trim())
    name?: string;

    @IsString()
    @IsOptional()
    @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
    @Transform(({ value }) => value?.trim())
    description?: string;

    @IsDateString({}, { message: 'Please provide a valid date' })
    @IsOptional()
    date?: string;

    @IsNumber()
    @Min(0, { message: 'Total amount must be positive' })
    @IsOptional()
    @Type(() => Number)
    totalAmount?: number;

    @IsBoolean()
    @IsOptional()
    divideEqually?: boolean;
}

export class CreatePartyItemDto {
    @IsString()
    @IsNotEmpty({ message: 'Item name is required' })
    @MinLength(2, { message: 'Item name must be at least 2 characters' })
    @MaxLength(200, { message: 'Item name must not exceed 200 characters' })
    @Transform(({ value }) => value?.trim())
    name: string;

    @IsString()
    @IsOptional()
    @IsUUID('4', { message: 'Invalid user ID format' })
    assignedToId?: string;
}

export class ContributeDto {
    @IsString()
    @IsNotEmpty({ message: 'User ID is required' })
    @IsUUID('4', { message: 'Invalid user ID format' })
    userId: string;

    @IsNumber()
    @Min(0.01, { message: 'Amount must be greater than 0' })
    @Type(() => Number)
    amount: number;
}

export class RegisterUserDto {
    @IsString()
    @IsNotEmpty({ message: 'User ID is required' })
    @IsUUID('4', { message: 'Invalid user ID format' })
    userId: string;
}
