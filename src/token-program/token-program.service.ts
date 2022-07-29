import { Metaplex } from '@metaplex-foundation/js';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  AccountLayout,
  ACCOUNT_SIZE,
  MINT_SIZE,
  MULTISIG_SIZE,
  TOKEN_PROGRAM_ID,
  transfer,
} from '@solana/spl-token';
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  PublicKeyInitData,
} from '@solana/web3.js';
import axios from 'axios';
import { getValuesInSOLAndLamports } from 'src/common/helpers';
import { GetMinimumBalanceDTO } from '../account/dto/get-minimum-balance.dto';
import { RequestAirdropDTO } from '../wallet/dto/request-airdrop.dto';

@Injectable()
export class TokenProgramService {
  private readonly logger = new Logger(TokenProgramService.name);
  private readonly cluster = clusterApiUrl('devnet');
  private readonly connection = new Connection(this.cluster, 'confirmed');
  private readonly metaplex = new Metaplex(this.connection);

  async getMintMetadata(mint: string) {
    try {
      this.logger.log(`Fetching metadata for mint ${mint}`);

      const mintPK = new PublicKey(mint);

      const nft = await this.metaplex.nfts().findByMint(mintPK);

      const { json } = await nft.run();

      return {
        statusCode: HttpStatus.OK,
        data: json,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
