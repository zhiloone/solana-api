import { Metaplex } from '@metaplex-foundation/js';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AccountLayout, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  PublicKeyInitData,
} from '@solana/web3.js';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bs58 = require('bs58');
import {
  buildResponseObject,
  getValuesInSOLAndLamports,
} from 'src/common/helpers';
import { RequestAirdropDTO } from './dto/request-airdrop.dto';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  private readonly cluster = clusterApiUrl('devnet');
  private readonly commitmet = 'confirmed';
  private readonly connection = new Connection(this.cluster, this.commitmet);
  private readonly metaplex = new Metaplex(this.connection);

  async createWallet() {
    try {
      this.logger.log(`Creating a new wallet`);

      const keypair = new Keypair();

      return buildResponseObject(
        {
          publicKey: keypair.publicKey.toBase58(),
          privateKey: {
            base58: bs58.encode(keypair.secretKey),
            array: Array.from(keypair.secretKey),
            uint8Array: keypair.secretKey,
          },
        },
        HttpStatus.CREATED,
      );
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async requestAirdrop(
    walletPublicKey: PublicKeyInitData,
    data: RequestAirdropDTO,
  ) {
    try {
      const lamports = data.lamports || LAMPORTS_PER_SOL;

      const value = getValuesInSOLAndLamports(lamports);

      this.logger.log(
        `Requesting an airdrop of ${value.SOL} SOL to ${walletPublicKey}`,
      );

      const publicKeyObject = new PublicKey(walletPublicKey);

      const airdropSignature = await this.connection.requestAirdrop(
        publicKeyObject,
        value.lamports,
      );

      const latestBlockHash = await this.connection.getLatestBlockhash();

      const txResponse = await this.connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: airdropSignature,
      });

      return buildResponseObject({
        cluster: this.cluster,
        destinationWallet: walletPublicKey,
        amount: value,
        transactionResponse: txResponse,
      });
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async getAllOwnedTokens(walletPublicKey: string) {
    try {
      this.logger.log(
        `Requesting all owned tokens for wallet ${walletPublicKey}`,
      );

      const tokenAccounts = await this.connection.getTokenAccountsByOwner(
        new PublicKey(walletPublicKey),
        {
          programId: TOKEN_PROGRAM_ID,
        },
      );

      const response = tokenAccounts.value.map((tokenAccountValue) => {
        const accountInfo = AccountLayout.decode(
          tokenAccountValue.account.data,
        );

        return buildResponseObject({
          ...accountInfo,
          amount: Number(accountInfo.amount),
          isNative: Number(accountInfo.isNative),
          delegatedAmount: Number(accountInfo.delegatedAmount),
        });
      });

      return buildResponseObject({
        message: !response.length ? 'Nothing was found' : undefined,
        response,
      });
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async getAccountInfo(walletPublicKey: string) {
    try {
      this.logger.log(`Getting acount info for ${walletPublicKey}`);

      const publicKey = new PublicKey(walletPublicKey);

      const accountInfo = await this.connection.getAccountInfo(
        publicKey,
        this.commitmet,
      );

      const balance = await this.connection.getBalance(
        publicKey,
        this.commitmet,
      );

      return buildResponseObject({
        accountInfo,
        balance: getValuesInSOLAndLamports(balance),
      });
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
