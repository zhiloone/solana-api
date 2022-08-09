import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional } from 'class-validator';

export class GetMinimumBalanceDTO {
  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  @IsBoolean()
  shouldCheckAccount?: boolean;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  @IsBoolean()
  shouldCheckMint?: boolean;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  @IsBoolean()
  shouldCheckMultisig?: boolean;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @IsArray()
  customByteLengthArray?: number[];
}
