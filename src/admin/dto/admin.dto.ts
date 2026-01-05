import { IsOptional, IsInt, Min, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    limit?: number = 10;
}

export class UserFilterDto extends PaginationDto {
    @IsOptional()
    @IsString()
    search?: string; // Search by name or email

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isAdmin?: boolean;
}

export class PartyFilterDto extends PaginationDto {
    @IsOptional()
    @IsString()
    search?: string; // Search by name or description
}

export class ToggleUserStatusDto {
    @IsBoolean()
    isActive: boolean;
}

export class ToggleAdminDto {
    @IsBoolean()
    isAdmin: boolean;
}
