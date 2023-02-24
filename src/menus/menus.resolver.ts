import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { MenusService } from './menus.service';
import { Menu, MenuConnection } from './entities/menu.entity';
import { CreateMenuInput } from './inputs/create-menu.input';
import { UpdateMenuInput } from './inputs/update-menu.input';
import { PaginationArgs } from 'src/common/schema/args/pagination.arg';
import { FindMenuSortArgs } from './args/find-menu-sort.arg';
import { MenuRevision } from './entities/menu-revision.entity';
import { CreateMenuRevisionInput } from './inputs/create-menu-revision.input';

@Resolver(() => Menu)
export class MenusResolver {
  constructor(private readonly menusService: MenusService) {}

  @Mutation(() => Menu)
  createMenu(@Args('createMenuInput') createMenuInput: CreateMenuInput) {
    return this.menusService.create(createMenuInput);
  }

  @Query(() => MenuConnection, { name: 'menus' })
  findAll(@Args() pagination: PaginationArgs, @Args() sort: FindMenuSortArgs) {
    return this.menusService.findAll(pagination, sort);
  }

  @Query(() => Menu, { name: 'menu' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.menusService.findOne(id);
  }

  @Mutation(() => Menu)
  updateMenu(@Args('updateMenuInput') updateMenuInput: UpdateMenuInput) {
    return this.menusService.update(updateMenuInput.id, updateMenuInput);
  }

  @Mutation(() => Boolean)
  async removeMenu(@Args('id', { type: () => Int }) id: number) {
    //return this.menusService.remove(id);
    await this.menusService.remove(id);

    return true;
  }

  @Mutation(() => MenuRevision)
  createRevision(
    @Args('createMenuRevisionInput')
    createMenuRevisionInput: CreateMenuRevisionInput,
  ) {
    return this.menusService.createRevision(createMenuRevisionInput);
  }

  @Mutation(() => Menu)
  restoreRevision(
    @Args('menuId', { type: () => Int }) menuId: number,
    @Args('revisionId', { type: () => Int }) revisionId: number,
  ) {
    return this.menusService.restoreRevision(menuId, revisionId);
  }
}
