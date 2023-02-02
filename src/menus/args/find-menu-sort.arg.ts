import { ArgsType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { Direction } from 'src/common/schema/enums/direction.enum';
import { MenuSort } from '../entities/menu.entity';

@ArgsType()
export class FindMenuSortArgs {
  @Field(() => MenuSort, { nullable: true })
  @IsOptional()
  sort?: MenuSort;

  @Field(() => Direction, { nullable: true })
  @IsOptional()
  direction?: Direction;
}
