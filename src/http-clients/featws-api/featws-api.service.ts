import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { isAxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { CreateRulesheetDto } from './dtos/create-rulesheet.dto';
import { RulesheetResponseDto } from './dtos/rulesheet-response.dto';
import { UpdateRulesheetDto } from './dtos/update-rulesheet.dto';
import { FeatwsApiError } from './featws-api.errors';
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
    try {
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
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new FeatwsApiError(
          error.response.data?.message || error.message,
          {
            status: error.response.status,
          },
        );
      } else {
        throw new FeatwsApiError(error.message);
      }
    }
  }

  async updateRulesheet(updateRulesheetDto: UpdateRulesheetDto) {
    try {
      const response = await firstValueFrom(
        this.httpService.put<RulesheetResponseDto>(
          `${this.options.url}/v1/rulesheets`,
          updateRulesheetDto,
          {
            headers: this.defaultHeaders,
          },
        ),
      );
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new FeatwsApiError(
          error.response.data?.message || error.message,
          {
            status: error.response.status,
          },
        );
      } else {
        throw new FeatwsApiError(error.message);
      }
    }
  }
}
