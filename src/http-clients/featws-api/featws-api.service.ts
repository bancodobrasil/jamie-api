import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { MODULE_OPTIONS_TOKEN } from './featws-api.module-definition';
import { FeatwsApiOptions } from './featws-api.options';

@Injectable()
export class FeatwsApiService {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private readonly options: FeatwsApiOptions,
    private readonly httpService: HttpService,
  ) {}

  async createRulesheet() {
    const response = await this.httpService
      .post('http://localhost:3000/rulesheets', {
        name: 'test',
        description: 'test',
        rules: [
          {
            name: 'test',
            description: 'test',
            conditions: [
              {
                name: 'test',
                description: 'test',
                type: 'test',
                value: 'test',
              },
            ],
            actions: [
              {
                name: 'test',
                description: 'test',
                type: 'test',
                value: 'test',
              },
            ],
          },
        ],
      })
      .toPromise();
    return response.data;
  }
}
