import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MinLength,
    IsEnum,
    IsOptional,
    MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from 'src/common/enums/user-role.enum';

export class RegisterDto {
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @Transform(({ value }) => value?.toLowerCase())
    email: string;

    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: string;

    @IsString()
    @IsNotEmpty({ message: 'First name is required' })
    @MaxLength(100, { message: 'First name must not exceed 100 characters' })
    firstName: string;

    @IsString()
    @IsNotEmpty({ message: 'Last name is required' })
    @MaxLength(100, { message: 'Last name must not exceed 100 characters' })
    lastName: string;

    @IsOptional()
    @IsEnum(UserRole, { message: 'Invalid role provided' })
    role?: UserRole;
}