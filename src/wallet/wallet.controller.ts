import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RequestAirdropDTO } from './dto/request-airdrop.dto';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  async createWallet() {
    return this.walletService.createWallet();
  }

  @Get(':walletPublicKey')
  async getAccountInfo(@Param('walletPublicKey') walletPublicKey: string) {
    return this.walletService.getAccountInfo(walletPublicKey);
  }

  @Post(':walletPublicKey/airdrop')
  async requestAirdropForWallet(
    @Param('walletPublicKey') walletPublicKey: string,
    @Body() data: RequestAirdropDTO,
  ) {
    return this.walletService.requestAirdrop(walletPublicKey, data);
  }

  @Get(':walletPublicKey/tokens')
  async getAllOwnedTokens(@Param('walletPublicKey') walletPublicKey: string) {
    return this.walletService.getAllOwnedTokens(walletPublicKey);
  }
}
