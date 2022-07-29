import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class RequestAirdropDTO {
  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @IsNumber()
  lamports?: number;
}
