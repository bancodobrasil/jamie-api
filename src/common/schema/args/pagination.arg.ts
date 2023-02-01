import { ArgsType, Int, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@ArgsType()
export class PaginationArgs {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  first?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  after?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  last?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  before?: string;
}
