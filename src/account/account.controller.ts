import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AccountService } from './account.service';
import { ArweaveCostService } from './areweave-cost.service';
import { GetMinimumBalanceDTO } from './dto/get-minimum-balance.dto';

@Controller('account')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly arweaveCostService: ArweaveCostService,
  ) {}

  @Post('rent-exempt')
  async getMinimumBalanceForRentExemption(@Body() data: GetMinimumBalanceDTO) {
    return this.accountService.getMinimumBalanceForRentExemption(data);
  }

  @Get('cost/:byteLength')
  async getCost(@Param('byteLength') byteLength: string) {
    return this.arweaveCostService.getCosts(byteLength);
  }
}
