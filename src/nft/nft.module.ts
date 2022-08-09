import { Module } from '@nestjs/common';
import { NftService } from './nft.service';
import { NftController } from './nft.controller';
import { WalletModule } from 'src/wallet/wallet.module';
import { AccountModule } from 'src/account/account.module';

@Module({
  imports: [WalletModule, AccountModule],
  controllers: [NftController],
  providers: [NftService],
})
export class NftModule {}
