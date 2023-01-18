import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from './entities/menu.entity';
import { MenusService } from './menus.service';

describe('MenusService', () => {
  let service: MenusService;
  let repository: Repository<Menu>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MenusService],
    }).compile();

    service = module.get<MenusService>(MenusService);
    repository = module.get<Repository<Menu>>(getRepositoryToken(Menu));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
