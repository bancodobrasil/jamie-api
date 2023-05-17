import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { CreateRulesheetDto } from './dtos/create-rulesheet.dto';
import { RulesheetResponseDto } from './dtos/rulesheet-response.dto';
import { MODULE_OPTIONS_TOKEN } from './featws-api.module-definition';
import { FeatwsApiOptions } from './featws-api.options';

@Injectable()
export class FeatwsApiService {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private readonly options: FeatwsApiOptions,
    private readonly httpService: HttpService,
  ) {}

  private _defaultHeaders;
  private get defaultHeaders() {
    if (!this._defaultHeaders) {
      this._defaultHeaders = {
        'Content-Type': 'application/json',
        [this.options.apiKeyHeader]: this.options.apiKey,
      };
    }
    return this._defaultHeaders;
  }

  async createRulesheet(createRulesheetDto: CreateRulesheetDto) {
    const response = await firstValueFrom(
      this.httpService.post<RulesheetResponseDto>(
        `${this.options.url}/v1/rulesheets`,
        createRulesheetDto,
        {
          headers: this.defaultHeaders,
        },
      ),
    );
    return response.data;
  }
}
