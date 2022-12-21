import { Module } from '@nestjs/common';
import { MenuItemsService } from './menu-items.service';

@Module({
  providers: [MenuItemsService],
  exports: [MenuItemsService],
})
export class MenuItemsModule {}
