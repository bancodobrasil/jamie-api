import { Controller, Get, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { BusinessException } from './business.exception';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    // const menuItem = 1;
    // throw new BusinessException(
    //   'menu-item', 'Menu item id=${menuItem} was not found.',
    //   'Menu item not found',
    //   HttpStatus.NOT_FOUND,
    // )
    return this.appService.getHello();
  }
}
