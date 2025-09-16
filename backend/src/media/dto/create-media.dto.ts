import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUUID, IsArray } from 'class-validator';

export class CreateMediaDto {
    @IsOptional()
    @IsUUID()
    categoryId?: string;

    @IsOptional()
    @IsString()
    sku?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch {
                return [value];
            }
        }
        return value;
    })
    tags?: string[];

    @IsOptional()
    @IsString()
    description?: string;
}
