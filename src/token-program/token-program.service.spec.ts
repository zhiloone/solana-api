import { Test, TestingModule } from '@nestjs/testing';
import { TokenProgramService } from './token-program.service';

describe('TokenProgramService', () => {
  let service: TokenProgramService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TokenProgramService],
    }).compile();

    service = module.get<TokenProgramService>(TokenProgramService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
