import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';
import { WalletModule } from 'src/wallet/wallet.module';
import { AccountModule } from 'src/account/account.module';
import { TransactionModule } from 'src/transaction/transaction.module';

@Module({
  imports: [WalletModule, AccountModule, TransactionModule],
  controllers: [TokenController],
  providers: [TokenService],
})
export class TokenModule {}
