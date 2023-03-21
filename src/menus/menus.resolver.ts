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
import { Roles } from 'nest-keycloak-connect';
import { Req } from '@nestjs/common';
import { Request } from 'express';

@Resolver(() => Menu)
export class MenusResolver {
  constructor(private readonly menusService: MenusService) {}

  @Mutation(() => Menu)
  @Roles({ roles: ['realm:editor'] })
  createMenu(@Args('createMenuInput') createMenuInput: CreateMenuInput) {
    return this.menusService.create(createMenuInput);
  }

  @Query(() => MenuConnection, { name: 'menus' })
  @Roles({ roles: ['realm:reader'] })
  findAll(@Args() pagination: PaginationArgs, @Args() sort: FindMenuSortArgs) {
    return this.menusService.findAll(pagination, sort);
  }

  @Query(() => Menu, { name: 'menu' })
  @Roles({ roles: ['realm:reader'] })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.menusService.findOne(id);
  }

  @Mutation(() => Menu)
  @Roles({ roles: ['realm:editor'] })
  updateMenu(
    @Args('updateMenuInput') updateMenuInput: UpdateMenuInput,
    @Req() request: Request,
  ) {
    return this.menusService.update(
      updateMenuInput.id,
      updateMenuInput,
      request.user,
    );
  }

  @Mutation(() => Boolean)
  @Roles({ roles: ['realm:editor'] })
  removeMenu(@Args('id', { type: () => Int }) id: number) {
    return this.menusService.remove(id);
  }

  @Mutation(() => Menu)
  @Roles({ roles: ['realm:editor'] })
  createRevision(
    @Args('createMenuRevisionInput')
    createMenuRevisionInput: CreateMenuRevisionInput,
  ) {
    return this.menusService.createRevision(createMenuRevisionInput);
  }

  @Mutation(() => Menu)
  @Roles({ roles: ['realm:editor'] })
  restoreRevision(
    @Args('menuId', { type: () => Int }) menuId: number,
    @Args('revisionId', { type: () => Int }) revisionId: number,
  ) {
    return this.menusService.restoreRevision(menuId, revisionId);
  }

  @Mutation(() => Menu)
  @Roles({ roles: ['realm:manager'] })
  publishRevision(
    @Args('menuId', { type: () => Int }) menuId: number,
    @Args('revisionId', { type: () => Int }) revisionId: number,
  ) {
    return this.menusService.publishRevision(menuId, revisionId);
  }

  @Query(() => String)
  @Roles({ roles: ['realm:reader'] })
  renderMenuTemplate(
    @Args('renderMenuTemplateInput')
    renderMenuTemplateInput: RenderMenuTemplateInput,
  ) {
    return this.menusService.renderMenuTemplate(renderMenuTemplateInput);
  }

  @Query(() => String)
  @Roles({ roles: ['realm:reader'] })
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
