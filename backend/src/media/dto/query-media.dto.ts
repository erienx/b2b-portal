import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class QueryMediaDto {
    @IsOptional()
    @IsString()
    sku?: string;

    @IsOptional()
    @IsString()
    tag?: string;

    @IsOptional()
    @IsString()
    categoryId?: string;

    @IsOptional()
    @IsString()
    filename?: string;

    @IsOptional()
    @IsNumberString()
    page?: string;

    @IsOptional()
    @IsNumberString()
    limit?: string;

    @IsOptional()
    @IsString()
    sort?: string;
}
