import { Controller, Get, Param } from '@nestjs/common';
import { TokenProgramService } from './token-program.service';

@Controller({ path: 'token-program' })
export class TokenProgramController {
  constructor(private readonly tokenProgramService: TokenProgramService) {}

  @Get('mint/:mint/metadata')
  async getMintMetadata(@Param('mint') mint: string) {
    return this.tokenProgramService.getMintMetadata(mint);
  }
}
