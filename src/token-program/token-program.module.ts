import { Module } from '@nestjs/common';
import { TokenProgramService } from './token-program.service';
import { TokenProgramController } from './token-program.controller';

@Module({
  controllers: [TokenProgramController],
  providers: [TokenProgramService],
})
export class TokenProgramModule {}
