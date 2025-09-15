import { IsOptional, IsUUID, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { UserAction } from 'src/common/enums/user-action.enum';

export class LogsQueryDto {
    @IsOptional()
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    limit?: number = 50;

    @IsOptional()
    @IsUUID()
    userId?: string;

    @IsOptional()
    @IsEnum(UserAction)
    action?: UserAction;

    @IsOptional()
    @IsString()
    resourceType?: string;

    @IsOptional()
    @IsString()
    search?: string;
    @IsOptional()
    @IsString()
    dateFrom?: string;
    @IsOptional()
    @IsString()
    dateTo?: string;
}
