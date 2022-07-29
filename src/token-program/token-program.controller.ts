import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GetMinimumBalanceDTO } from './dto/get-minimum-balance.dto';
import { RequestAirdropDTO } from './dto/request-airdrop.dto';
import { TokenProgramService } from './token-program.service';

@Controller({ path: 'token-program' })
export class TokenProgramController {
  constructor(private readonly tokenProgramService: TokenProgramService) {}

  @Post(':walletPublicKey/airdrop')
  async requestAirdropForWallet(
    @Param('walletPublicKey') walletPublicKey: string,
    @Body() data: RequestAirdropDTO,
  ) {
    return this.tokenProgramService.requestAirdrop(walletPublicKey, data);
  }

  @Get(':walletPublicKey/tokens')
  async getAllOwnedTokens(@Param('walletPublicKey') walletPublicKey: string) {
    return this.tokenProgramService.getAllOwnedTokens(walletPublicKey);
  }

  @Get(':walletPublicKey/info')
  async getAccountInfo(@Param('walletPublicKey') walletPublicKey: string) {
    return this.tokenProgramService.getAccountInfo(walletPublicKey);
  }

  @Post('rent-exempt')
  async getMinimumBalanceForRentExemption(@Body() data: GetMinimumBalanceDTO) {
    return this.tokenProgramService.getMinimumBalanceForRentExemption(data);
  }
}
