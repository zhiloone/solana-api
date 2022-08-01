import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { ArweaveCostService } from './areweave-cost.service';

@Module({
  controllers: [AccountController],
  providers: [AccountService, ArweaveCostService],
  exports: [AccountService],
})
export class AccountModule {}
