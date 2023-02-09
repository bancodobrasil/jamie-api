import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { MenuItem } from './entities/menu-item.entity';
import { MenuItemsService } from './menu-items.service';

@Resolver(() => MenuItem)
export class MenuItemsResolver {
  constructor(private readonly menusService: MenuItemsService) {}

  @Query(() => MenuItem, { name: 'menuItem' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.menusService.findOne(id);
  }
}
