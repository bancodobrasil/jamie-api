import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreateRulesheetDto {
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  name: string;
}
