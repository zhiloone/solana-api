import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { validate } from './config/env.validation';
import { TokenModule } from './token/token.module';
import { WalletModule } from './wallet/wallet.module';
import { AccountModule } from './account/account.module';
import { TransactionModule } from './transaction/transaction.module';
import { NftModule } from './nft/nft.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    TokenModule,
    WalletModule,
    AccountModule,
    TransactionModule,
    NftModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
