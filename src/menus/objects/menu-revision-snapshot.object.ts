import { Field, ObjectType } from '@nestjs/graphql';
import { MenuItem } from 'src/menu-items/entities/menu-item.entity';
import { MenuMeta } from './menu-meta.object';

@ObjectType()
export class MenuRevisionSnapshot {
  @Field({ nullable: true })
  name: string;

  @Field(() => [MenuMeta], { nullable: true })
  meta?: MenuMeta[];

  @Field(() => [MenuItem], { nullable: true })
  items?: MenuItem[];

  @Field({ nullable: true })
  template?: string;

  @Field({ nullable: true })
  templateFormat?: string;
}
