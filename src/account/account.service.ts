import { Injectable, Logger } from '@nestjs/common';
import { ACCOUNT_SIZE, MINT_SIZE, MULTISIG_SIZE } from '@solana/spl-token';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import { getValuesInSOLAndLamports } from 'src/common/helpers';
import { GetMinimumBalanceDTO } from './dto/get-minimum-balance.dto';

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);
  private readonly cluster = clusterApiUrl('devnet');
  private readonly commitmet = 'confirmed';
  private readonly connection = new Connection(this.cluster, this.commitmet);

  async getMinimumBalanceForRentExemption(body: GetMinimumBalanceDTO) {
    try {
      const {
        shouldCheckAccount,
        shouldCheckMint,
        shouldCheckMultisig,
        customByteLengthArray = [100],
      } = body;

      const infosToCheck: { name: string; size: number }[] = [];

      if (shouldCheckAccount)
        infosToCheck.push({ name: 'account', size: ACCOUNT_SIZE });
      if (shouldCheckMint) infosToCheck.push({ name: 'mint', size: MINT_SIZE });
      if (shouldCheckMultisig)
        infosToCheck.push({ name: 'multisig', size: MULTISIG_SIZE });
      customByteLengthArray.forEach((customByteLength, index) => {
        infosToCheck.push({ name: `custom_${index}`, size: customByteLength });
      });

      this.logger.log(`Checking minimum balance for rent exemption`);

      const promises = infosToCheck.map((byteToCheck) => {
        return this.connection.getMinimumBalanceForRentExemption(
          byteToCheck.size,
        );
      });

      const arrayOfResponses = await Promise.all(promises);

      const responseObject: {
        [key: string]: {
          size: number;
          value: {
            SOL: number;
            lamports: number;
          };
        };
      } = {};

      arrayOfResponses.forEach((result, index) => {
        responseObject[infosToCheck[index].name] = {
          size: infosToCheck[index].size,
          value: getValuesInSOLAndLamports(result),
        };
      });

      return responseObject;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
