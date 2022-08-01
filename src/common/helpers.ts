import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { WINSTONS_PER_AR } from './consts';

export function getValuesInSOLAndLamports(value: number, isItInSOL?: boolean) {
  const valueInSOL = isItInSOL ? value : value / LAMPORTS_PER_SOL;
  const valueInLamports = isItInSOL ? value * LAMPORTS_PER_SOL : value;

  return { SOL: valueInSOL, lamports: Math.ceil(valueInLamports) };
}

export function getValuesInARAndWinstons(value: number, isItInAR?: boolean) {
  const valueInAR = isItInAR ? value : value / WINSTONS_PER_AR;
  const valueInWinstons = isItInAR ? value * WINSTONS_PER_AR : value;

  return { AR: valueInAR, winstons: Math.ceil(valueInWinstons) };
}
