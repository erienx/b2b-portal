import { IsDateString, IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class CreateSubstitutionDto {
    @IsUUID()
    exportManagerId: string;

    @IsUUID()
    substituteId: string;

    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean = true;
}