import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { MenuItemsService } from './menu-items.service';
import { MenuItemsResolver } from './menu-items.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([MenuItem])],
  providers: [MenuItemsService, MenuItemsResolver],
  exports: [MenuItemsService],
})
export class MenuItemsModule {}
