import {
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { MapStringUnknown } from 'src/common/types/common.type';

export class UpdateRulesheetDto {
  @IsDefined()
  id: number;

  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsNotEmpty()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  features: MapStringUnknown[] = [];

  @IsArray()
  @ValidateNested({ each: true })
  parameters: MapStringUnknown[] = [];

  @IsObject()
  rules: MapStringUnknown = {};
}
