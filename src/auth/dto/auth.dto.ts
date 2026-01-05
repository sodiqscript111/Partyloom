import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsStrongPassword } from '../../common/validators/custom-validators';

export class RegisterDto {
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

    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    @IsStrongPassword()
    password: string;
}

export class LoginDto {
    @IsEmail({}, { message: 'Please provide a valid email' })
    @IsNotEmpty({ message: 'Email is required' })
    @Transform(({ value }) => value?.toLowerCase().trim())
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    password: string;
}
