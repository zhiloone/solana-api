import { Metaplex } from '@metaplex-foundation/js';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  Account,
  AuthorityType,
  createMint,
  createSetAuthorityInstruction,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from '@solana/spl-token';
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from '@solana/web3.js';
import { AccountService } from 'src/account/account.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { WalletService } from 'src/wallet/wallet.service';

@Injectable()
export class TokenService {
  constructor(
    private readonly walletService: WalletService,
    private readonly accountService: AccountService,
    private readonly transactionService: TransactionService,
  ) {}

  private readonly logger = new Logger(TokenService.name);
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

  async mint() {
    try {
      const newWallet = await this.walletService.createWallet();
      const newMint = await this.walletService.createWallet();

      this.logger.log(`Minting a single token for ${newWallet.publicKey}`);

      const wallet = Keypair.fromSecretKey(newWallet.privateKey.uint8Array);
      const mint = Keypair.fromSecretKey(newMint.privateKey.uint8Array);

      const { arrayOfResponseData } =
        await this.accountService.getMinimumBalanceForRentExemption({
          shouldCheckMint: true,
        });

      const mintPrice = arrayOfResponseData[0].value;

      const accountInfo = await this.walletService.getAccountInfo(
        wallet.publicKey.toBase58(),
      );

      if (accountInfo.balance.lamports < mintPrice.lamports) {
        await this.walletService.requestAirdrop(wallet.publicKey.toBase58(), {
          lamports: mintPrice.lamports,
        });
      }

      const createdMint = await createMint(
        this.connection,
        wallet,
        wallet.publicKey,
        wallet.publicKey,
        0,
      );

      let associatedTokenAccount: Account;

      try {
        associatedTokenAccount = await getOrCreateAssociatedTokenAccount(
          this.connection,
          wallet,
          createdMint,
          wallet.publicKey,
        );

        console.log({ associatedTokenAccount });
      } catch (error) {
        console.log({ error });

        if (!associatedTokenAccount) {
          await this.walletService.requestAirdrop(wallet.publicKey, {});

          associatedTokenAccount = await getOrCreateAssociatedTokenAccount(
            this.connection,
            wallet,
            createdMint,
            wallet.publicKey,
          );
        }
      }

      const mintToResult = await mintTo(
        this.connection,
        wallet,
        createdMint,
        associatedTokenAccount.address,
        wallet,
        1,
      );

      const transaction = new Transaction().add(
        createSetAuthorityInstruction(
          createdMint,
          wallet.publicKey,
          AuthorityType.MintTokens,
          null,
        ),
      );

      const transactionHash = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [wallet],
      );

      return {
        mintOwner: wallet,
        mintToResult,
        transactionHash,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
