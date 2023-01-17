import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MenuItem } from 'src/menu-items/entities/menu-item.entity';
import { MenuItemsService } from 'src/menu-items/menu-items.service';
import { Repository } from 'typeorm';
import { CreateMenuInput } from './dto/create-menu.input';
import { UpdateMenuInput } from './dto/update-menu.input';
import { Menu } from './entities/menu.entity';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
    private readonly menuItemsService: MenuItemsService,
  ) {}

  async create(createMenuInput: CreateMenuInput) {
    const menu = new Menu();
    menu.name = createMenuInput.name;

    const saved = await this.menuRepository.save(menu);

    if (createMenuInput.items) {
      menu.items = Promise.all(
        createMenuInput.items.map((mii) =>
          this.menuItemsService.handle(saved, mii),
        ),
      );
    }

    return saved;
  }

  findAll() {
    return this.menuRepository.find();
  }

  findOne(id: number) {
    return this.menuRepository.findOneBy({ id: id });
  }

  update(id: number, updateMenuInput: UpdateMenuInput) {
    const menu = new Menu();
    menu.id = id;
    menu.name = updateMenuInput.name;
    return this.menuRepository.save(menu);
  }

  remove(id: number) {
    return this.menuRepository.delete(id);
  }
}
