import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { MenusService } from './menus.service';
import { Menu } from './entities/menu.entity';
import { CreateMenuInput } from './dto/create-menu.input';
import { UpdateMenuInput } from './dto/update-menu.input';
import { MenuItemsService } from 'src/menu-items/menu-items.service';
import { MenuItem } from 'src/menu-items/entities/menu-item.entity';

@Resolver(() => Menu)
export class MenusResolver {
  constructor(
    private readonly menusService: MenusService,
    private readonly menuItemsService: MenuItemsService,
  ) {}

  @Mutation(() => Menu)
  createMenu(@Args('createMenuInput') createMenuInput: CreateMenuInput) {
    return this.menusService.create(createMenuInput);
  }

  @Query(() => [Menu], { name: 'menus' })
  findAll() {
    return this.menusService.findAll();
  }

  @Query(() => Menu, { name: 'menu' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.menusService.findOne(id);
  }

  @Mutation(() => Menu)
  updateMenu(@Args('updateMenuInput') updateMenuInput: UpdateMenuInput) {
    return this.menusService.update(updateMenuInput.id, updateMenuInput);
  }

  @Mutation(() => Menu)
  removeMenu(@Args('id', { type: () => Int }) id: number) {
    return this.menusService.remove(id);
  }

  @ResolveField('items', () => [MenuItem])
  getItems(@Parent() menu: Menu) {
    const { id } = menu;
    return this.menuItemsService.findAll({ menuId: id });
  }
}
