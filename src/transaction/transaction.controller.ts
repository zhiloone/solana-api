import { Body, Controller, Post } from '@nestjs/common';
import { TransferSolDTO } from './dto/transfer-sol.dto';
import { TransactionService } from './transaction.service';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('transfer')
  async transferSol(@Body() data: TransferSolDTO) {
    return this.transactionService.transferSol(data);
  }
}
