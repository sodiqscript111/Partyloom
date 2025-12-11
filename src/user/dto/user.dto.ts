import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty({ message: 'Name is required' })
    name: string;

    @IsEmail({}, { message: 'Please provide a valid email' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;
}

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsEmail({}, { message: 'Please provide a valid email' })
    @IsOptional()
    email?: string;
}
