import { Metaplex } from '@metaplex-foundation/js';
import { Injectable, Logger } from '@nestjs/common';
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { DEVNET_KEYPAIR_1 } from 'src/common/consts';
import {
  buildResponseObject,
  getValuesInSOLAndLamports,
} from 'src/common/helpers';
import { WalletService } from 'src/wallet/wallet.service';
import { TransferSolDTO } from './dto/transfer-sol.dto';

@Injectable()
export class TransactionService {
  constructor(private readonly walletService: WalletService) {}

  private readonly logger = new Logger(TransactionService.name);
  private readonly cluster = clusterApiUrl('devnet');
  private readonly commitment = 'confirmed';
  private readonly connection = new Connection(this.cluster, this.commitment);
  private readonly metaplex = new Metaplex(this.connection);

  async transferSol(body: TransferSolDTO) {
    try {
      const { receiverWalletPublicKey, SOL, lamports } = body;

      if (!SOL && !lamports) {
        throw new Error('Must provide "SOL" or "lamports" value');
      }

      const value = getValuesInSOLAndLamports(SOL || lamports, !!SOL);

      const { data } = await this.walletService.createWallet();

      this.logger.log(
        `Sending ${value.lamports} lamports from ${data.publicKey} to ${receiverWalletPublicKey}`,
      );

      const fromPubkey = new PublicKey(data.publicKey);
      const toPubkey = new PublicKey(receiverWalletPublicKey);

      await this.walletService.requestAirdrop(data.publicKey, {
        lamports: LAMPORTS_PER_SOL,
      });

      const transaction = new Transaction();

      transaction.add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports: value.lamports,
        }),
      );

      const transactionHash = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [Keypair.fromSecretKey(data.privateKey.uint8Array)],
        {
          commitment: this.commitment,
        },
      );

      return buildResponseObject(transactionHash);
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
