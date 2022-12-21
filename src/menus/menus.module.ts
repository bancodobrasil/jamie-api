import { Module } from '@nestjs/common';
import { MenusService } from './menus.service';
import { MenusResolver } from './menus.resolver';
import { MenuItemsModule } from 'src/menu-items/menu-items.module';

@Module({
  imports: [MenuItemsModule],
  providers: [MenusResolver, MenusService],
})
export class MenusModule {}
