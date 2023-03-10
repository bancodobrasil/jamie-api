import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { MenusService } from './menus.service';
import { Menu, MenuConnection } from './entities/menu.entity';
import { CreateMenuInput } from './inputs/create-menu.input';
import { UpdateMenuInput } from './inputs/update-menu.input';
import { PaginationArgs } from 'src/common/schema/args/pagination.arg';
import { FindMenuSortArgs } from './args/find-menu-sort.arg';
import { CreateMenuRevisionInput } from './inputs/create-menu-revision.input';
import { RenderMenuTemplateInput } from './inputs/render-menu-template.input';
import { RenderMenuItemTemplateInput } from './inputs/render-menu-item-template.input';

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
  removeMenu(@Args('id', { type: () => Int }) id: number) {
    return this.menusService.remove(id);
  }

  @Mutation(() => Menu)
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

  @Mutation(() => Menu)
  publishRevision(
    @Args('menuId', { type: () => Int }) menuId: number,
    @Args('revisionId', { type: () => Int }) revisionId: number,
  ) {
    return this.menusService.publishRevision(menuId, revisionId);
  }

  @Query(() => String)
  renderMenuTemplate(
    @Args('renderMenuTemplateInput')
    renderMenuTemplateInput: RenderMenuTemplateInput,
  ) {
    return this.menusService.renderMenuTemplate(renderMenuTemplateInput);
  }

  @Query(() => String)
  renderMenuItemTemplate(
    @Args('renderMenuItemTemplateInput')
    renderMenuItemTemplateInput: RenderMenuItemTemplateInput,
    @Args('renderMenuTemplateInput')
    renderMenuTemplateInput: RenderMenuTemplateInput,
  ) {
    return this.menusService.renderMenuItemTemplate(
      renderMenuItemTemplateInput,
      renderMenuTemplateInput,
    );
  }
}
