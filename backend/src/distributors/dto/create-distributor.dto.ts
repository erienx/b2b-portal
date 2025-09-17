import { IsString, IsNotEmpty, IsOptional, IsUUID, IsArray, ArrayNotEmpty, Length, IsAlpha, IsAlphanumeric } from 'class-validator';

export class CreateDistributorDto {
    @IsString()
    @IsNotEmpty({ message: 'Company name is required' })
    @Length(1, 255, { message: 'Company name must be between 1 and 255 characters' })
    company_name: string;

    @IsString()
    @IsNotEmpty({ message: 'Country is required' })
    @IsAlpha()
    @Length(2, 2, { message: 'Country must be exactly 2 characters' })
    country: string;

    @IsString()
    @IsNotEmpty({ message: 'Currency is required' })
    @IsAlphanumeric()
    @Length(3, 3, { message: 'Currency must be exactly 3 characters' })
    currency: string;

    @IsOptional()
    @IsUUID('4', { message: 'Export manager ID must be a valid UUID' })
    exportManagerId?: string;

    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true, message: 'Each assigned user ID must be a valid UUID' })
    assignedUsers?: string[];
}