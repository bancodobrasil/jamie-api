import { Module } from '@nestjs/common';
import { MenusService } from './menus.service';
import { MenusResolver } from './menus.resolver';
import { MenuItemsModule } from 'src/menu-items/menu-items.module';
import { Menu } from './entities/menu.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Menu]), MenuItemsModule],
  providers: [MenusResolver, MenusService],
})
export class MenusModule {}
