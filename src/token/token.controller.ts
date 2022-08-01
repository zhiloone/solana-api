import { Controller, Get, Param, Post } from '@nestjs/common';
import { TokenService } from './token.service';

@Controller({ path: 'token' })
export class TokenController {
  constructor(private readonly tokenProgramService: TokenService) {}

  @Post('mint')
  async mint() {
    return this.tokenProgramService.mint();
  }

  @Get('mint/:mint/metadata')
  async getMintMetadata(@Param('mint') mint: string) {
    return this.tokenProgramService.getMintMetadata(mint);
  }
}
