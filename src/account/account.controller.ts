import { Body, Controller, Get, Post } from '@nestjs/common';
import { AccountService } from './account.service';
import { GetMinimumBalanceDTO } from './dto/get-minimum-balance.dto';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('rent-exempt')
  async getMinimumBalanceForRentExemption(@Body() data: GetMinimumBalanceDTO) {
    return this.accountService.getMinimumBalanceForRentExemption(data);
  }
}
