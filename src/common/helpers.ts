import { HttpStatus } from '@nestjs/common';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export function getValuesInSOLAndLamports(value: number, isItInSOL?: boolean) {
  const valueInSOL = isItInSOL ? value : value / LAMPORTS_PER_SOL;
  const valueInLamports = isItInSOL ? value * LAMPORTS_PER_SOL : value;

  return { SOL: valueInSOL, lamports: valueInLamports };
}

export function buildResponseObject(data: any, statusCode?: HttpStatus) {
  return {
    statusCode: statusCode || HttpStatus.OK,
    data,
  };
}
