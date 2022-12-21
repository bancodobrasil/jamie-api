import { Field, Int, ObjectType } from '@nestjs/graphql';
import { MenuItem } from 'src/menu-items/entities/menu-item.entity';

@ObjectType()
export class Menu {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => [MenuItem], { nullable: true })
  items?: MenuItem[];
}
