import {
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';

type MapStringUnknown = Record<string, unknown>;

export class RulesheetResponseDto {
  @IsDefined()
  id: number;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  slug: string;

  @IsNotEmpty()
  version: string;

  @IsOptional()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  features?: MapStringUnknown[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  parameters?: MapStringUnknown[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  rules?: MapStringUnknown;
}
