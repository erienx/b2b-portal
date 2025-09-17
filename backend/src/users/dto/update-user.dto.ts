import { IsEmail, IsString, IsEnum, IsOptional, MaxLength, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from 'src/common/enums/user-role.enum';

export class UpdateUserDto {
    @IsOptional()
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @Transform(({ value }) => value?.toLowerCase())
    email?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100, { message: 'First name must not exceed 100 characters' })
    firstName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100, { message: 'Last name must not exceed 100 characters' })
    lastName?: string;

    @IsOptional()
    @IsEnum(UserRole, { message: 'Invalid role provided' })
    role?: UserRole;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}