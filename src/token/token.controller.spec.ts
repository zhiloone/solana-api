import { Test, TestingModule } from '@nestjs/testing';
import { TokenController as TokenController } from './token.controller';
import { TokenService } from './token.service';

describe('TokenProgramController', () => {
  let controller: TokenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokenController],
      providers: [TokenService],
    }).compile();

    controller = module.get<TokenController>(TokenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
