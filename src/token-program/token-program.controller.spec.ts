import { Test, TestingModule } from '@nestjs/testing';
import { TokenProgramController } from './token-program.controller';
import { TokenProgramService } from './token-program.service';

describe('TokenProgramController', () => {
  let controller: TokenProgramController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokenProgramController],
      providers: [TokenProgramService],
    }).compile();

    controller = module.get<TokenProgramController>(TokenProgramController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
