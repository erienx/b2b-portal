import { PartialType } from '@nestjs/mapped-types';
import { CreateSubstitutionDto } from './create-substitution.dto';

export class UpdateSubstitutionDto extends PartialType(CreateSubstitutionDto) { }