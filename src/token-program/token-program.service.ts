import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  AccountLayout,
  ACCOUNT_SIZE,
  createAssociatedTokenAccountInstruction,
  createInitializeAccountInstruction,
  createMint,
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  mintTo,
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
import { GetMinimumBalanceDTO } from './dto/get-minimum-balance.dto';
import { RequestAirdropDTO } from './dto/request-airdrop.dto';

@Injectable()
export class TokenProgramService {
  private readonly logger = new Logger(TokenProgramService.name);
  private readonly cluster = clusterApiUrl('devnet');
  private readonly connection = new Connection(this.cluster, 'confirmed');

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

      return {
        statusCode: HttpStatus.OK,
        data: {
          cluster: this.cluster,
          destinationWallet: walletPublicKey,
          amount: value,
          transactionResponse: txResponse,
        },
      };
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async getMinimumBalanceForRentExemption(body: GetMinimumBalanceDTO) {
    try {
      const {
        shouldCheckAccount,
        shouldCheckMint,
        shouldCheckMultisig,
        customByteLength = 100,
      } = body;

      const infosToCheck: { name: string; size: number }[] = [];

      if (shouldCheckAccount)
        infosToCheck.push({ name: 'account', size: ACCOUNT_SIZE });
      if (shouldCheckMint) infosToCheck.push({ name: 'mint', size: MINT_SIZE });
      if (shouldCheckMultisig)
        infosToCheck.push({ name: 'multisig', size: MULTISIG_SIZE });
      if (customByteLength)
        infosToCheck.push({ name: 'custom', size: customByteLength });

      this.logger.log(`Checking minimum balance for rent exemption`);

      const requestBody = {
        jsonrpc: '2.0',
        id: 1,
        method: 'getMinimumBalanceForRentExemption',
      };

      const promises = infosToCheck.map((byteToCheck) => {
        return axios.post(this.cluster, {
          ...requestBody,
          params: [byteToCheck.size],
        });
      });

      const arrayOfResponses = await Promise.all(promises);

      const arrayOfResponseData = arrayOfResponses.map(({ data }, index) => {
        return {
          ...infosToCheck[index],
          value: getValuesInSOLAndLamports(data.result),
        };
      });

      return {
        statusCode: HttpStatus.OK,
        data: arrayOfResponseData,
      };
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

        return {
          ...accountInfo,
          amount: Number(accountInfo.amount),
          isNative: Number(accountInfo.isNative),
          delegatedAmount: Number(accountInfo.delegatedAmount),
        };
      });

      return {
        statusCode: HttpStatus.OK,
        data: {
          message: !response.length ? 'Nothing was found' : undefined,
          response,
        },
      };
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async getAccountInfo(walletPublicKey: string) {
    try {
      this.logger.log(`Getting acount info for ${walletPublicKey}`);

      const publicKey = new PublicKey(walletPublicKey);

      const response = await this.connection.getAccountInfo(publicKey);

      return {
        statusCode: HttpStatus.OK,
        data: response,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async test() {
    try {
      this.logger.log('teste');

      const payerKeypair = Keypair.generate();
      const payerPublicKeyObject = payerKeypair.publicKey;

      const ownerKeypair = Keypair.generate();
      const ownerPublicKeyObject = ownerKeypair.publicKey;

      const mintPublicKeyObject = new PublicKey(
        'Fngc3zEeAvcE5yLXBjJrYe2cPSgkzXpfzsktXutgpSRE',
      );

      // createAssociatedTokenAccountInstruction(
      //   payerPublicKeyObject,
      //   mintPublicKeyObject,
      //   ownerKeypair,
      // );
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
