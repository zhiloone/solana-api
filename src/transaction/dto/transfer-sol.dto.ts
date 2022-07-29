import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class TransferSolDTO {
  //   @IsNotEmpty()
  //   @IsString()
  //   senderWalletPublicKey: string;

  @IsNotEmpty()
  @IsString()
  receiverWalletPublicKey: string;

  @IsOptional()
  @IsNumber()
  SOL: number;

  @IsOptional()
  @IsNumber()
  lamports: number;
}
