import { Test, TestingModule } from '@nestjs/testing';
import { FeatwsApiService } from './featws-api.service';

describe('FeatwsApiService', () => {
  let service: FeatwsApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeatwsApiService],
    }).compile();

    service = module.get<FeatwsApiService>(FeatwsApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
