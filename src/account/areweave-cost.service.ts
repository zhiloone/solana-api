import {
  calculate,
  fetchArweaveStorageCost,
  fetchTokenPrices,
} from '@metaplex/arweave-cost';
import { Injectable, Logger } from '@nestjs/common';
import {
  getValuesInARAndWinstons,
  getValuesInSOLAndLamports,
} from 'src/common/helpers';

@Injectable()
export class ArweaveCostService {
  private readonly logger = new Logger(ArweaveCostService.name);

  async getCosts(byteLength: string) {
    try {
      this.logger.log(`Estimating costs for ${byteLength} bytes`);

      const data = await calculate([Number(byteLength)]);

      return {
        ...data,
        totalBytes: data.totalBytes,
        solana: getValuesInSOLAndLamports(data.solana, true),
        arweave: getValuesInARAndWinstons(data.arweave, true),
      };
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
