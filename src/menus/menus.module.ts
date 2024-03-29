import { Module } from '@nestjs/common';
import { MenusService } from './menus.service';
import { MenusResolver } from './menus.resolver';
import { MenuItemsModule } from 'src/menu-items/menu-items.module';
import { Menu } from './entities/menu.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuRevision } from './entities/menu-revision.entity';
import { MenuItem } from 'src/menu-items/entities/menu-item.entity';
import { StoreModule } from 'src/store/store.module';
import { storeConfig } from 'config/store.config';
import { MenuPendency } from './entities/menu-pendency.entity';
import { HttpClientsModule } from 'src/http-clients/http-clients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Menu, MenuItem, MenuRevision, MenuPendency]),
    StoreModule.registerAsync({
      useFactory: storeConfig,
    }),
    HttpClientsModule,
    MenuItemsModule,
  ],
  providers: [MenusResolver, MenusService],
})
export class MenusModule {}
