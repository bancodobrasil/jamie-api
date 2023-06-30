import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
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
import { MenuPendencyConnection } from './entities/menu-pendency.entity';
import { GraphQLResolverContext } from 'src/common/types/graphql.type';
import TemplateHelpers from 'src/common/helpers/template.helper';

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
    @Context() context: GraphQLResolverContext,
  ) {
    return this.menusService.update(
      updateMenuInput.id,
      updateMenuInput,
      context.req.user,
    );
  }

  @Mutation(() => Boolean)
  @Roles({ roles: ['realm:editor'] })
  removeMenu(@Args('id', { type: () => Int }) id: number) {
    return this.menusService.remove(id);
  }

  @Query(() => MenuPendencyConnection, { name: 'pendencies' })
  @Roles({ roles: ['realm:manager'] })
  findAllPendencies(
    @Args('menuId', { type: () => Int }) menuId: number,
    @Args() pagination: PaginationArgs,
  ) {
    return this.menusService.findAllPendencies(pagination, menuId);
  }

  @Mutation(() => Menu)
  @Roles({ roles: ['realm:manager'] })
  approvePendency(
    @Args('id', { type: () => Int }) id: number,
    @Args('menuId', { type: () => Int }) menuId: number,
    @Context() context: GraphQLResolverContext,
  ) {
    return this.menusService.approvePendency(id, menuId, context.req.user);
  }

  @Mutation(() => Boolean)
  @Roles({ roles: ['realm:manager'] })
  declinePendency(
    @Args('id', { type: () => Int }) id: number,
    @Args('menuId', { type: () => Int }) menuId: number,
    @Context() context: GraphQLResolverContext,
  ) {
    return this.menusService.declinePendency(id, menuId, context.req.user);
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
    return TemplateHelpers.renderMenuTemplate(renderMenuTemplateInput);
  }

  @Query(() => String)
  @Roles({ roles: ['realm:reader'] })
  renderMenuItemTemplate(
    @Args('renderMenuItemTemplateInput')
    renderMenuItemTemplateInput: RenderMenuItemTemplateInput,
    @Args('renderMenuTemplateInput')
    renderMenuTemplateInput: RenderMenuTemplateInput,
  ) {
    return TemplateHelpers.renderMenuItemTemplate(
      renderMenuItemTemplateInput,
      renderMenuTemplateInput,
    );
  }
}
