import { IsString, IsNotEmpty, IsOptional, IsDateString, IsNumber, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePartyDto {
    @IsString()
    @IsNotEmpty({ message: 'Party name is required' })
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDateString({}, { message: 'Please provide a valid date' })
    @IsNotEmpty({ message: 'Date is required' })
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
    name?: string;

    @IsString()
    @IsOptional()
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
    name: string;

    @IsString()
    @IsOptional()
    assignedToId?: string;
}

export class ContributeDto {
    @IsString()
    @IsNotEmpty({ message: 'User ID is required' })
    userId: string;

    @IsNumber()
    @Min(0.01, { message: 'Amount must be greater than 0' })
    @Type(() => Number)
    amount: number;
}

export class RegisterUserDto {
    @IsString()
    @IsNotEmpty({ message: 'User ID is required' })
    userId: string;
}
