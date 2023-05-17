import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FeatwsApiService {
  constructor(private readonly httpService: HttpService) {}
}
