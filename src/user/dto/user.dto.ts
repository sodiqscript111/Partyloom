import { IsString, IsEmail, IsNotEmpty, IsOptional, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty({ message: 'Name is required' })
    @MinLength(2, { message: 'Name must be at least 2 characters' })
    @MaxLength(100, { message: 'Name must not exceed 100 characters' })
    @Transform(({ value }) => value?.trim())
    name: string;

    @IsEmail({}, { message: 'Please provide a valid email' })
    @IsNotEmpty({ message: 'Email is required' })
    @Transform(({ value }) => value?.toLowerCase().trim())
    email: string;
}

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    @MinLength(2, { message: 'Name must be at least 2 characters' })
    @MaxLength(100, { message: 'Name must not exceed 100 characters' })
    @Transform(({ value }) => value?.trim())
    name?: string;

    @IsEmail({}, { message: 'Please provide a valid email' })
    @IsOptional()
    @Transform(({ value }) => value?.toLowerCase().trim())
    email?: string;
}
