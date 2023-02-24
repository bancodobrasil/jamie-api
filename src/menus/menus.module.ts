import { Module } from '@nestjs/common';
import { MenusService } from './menus.service';
import { MenusResolver } from './menus.resolver';
import { MenuItemsModule } from 'src/menu-items/menu-items.module';
import { Menu } from './entities/menu.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuRevision } from './entities/menu-revision.entity';
import { MenuItem } from 'src/menu-items/entities/menu-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Menu, MenuItem, MenuRevision]),
    MenuItemsModule,
  ],
  providers: [MenusResolver, MenusService],
})
export class MenusModule {}
