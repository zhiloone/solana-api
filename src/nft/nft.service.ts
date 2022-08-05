import {
  bundlrStorage,
  BundlrStorageDriver,
  CreateNftInput,
  keypairIdentity,
  Metaplex,
  toMetaplexFile,
} from '@metaplex-foundation/js';
import { Injectable, Logger } from '@nestjs/common';
import { clusterApiUrl, Connection, Keypair } from '@solana/web3.js';
import { WalletService } from 'src/wallet/wallet.service';

@Injectable()
export class NftService {
  private readonly logger = new Logger(NftService.name);
  private readonly cluster = clusterApiUrl('devnet');
  private readonly commitmet = 'confirmed';
  private readonly connection = new Connection(this.cluster, this.commitmet);

  constructor(private readonly walletService: WalletService) {}

  async mintNft(file: Express.Multer.File) {
    try {
      this.logger.log(`mintNft started`);

      const wallet = Keypair.generate();

      await this.walletService.requestAirdrop(wallet.publicKey.toBase58(), {});

      this.logger.log(`Initializing metaplex provider`);

      const metaplexPluginBundlr = bundlrStorage({
        address: 'https://devnet.bundlr.network',
        providerUrl: 'https://api.devnet.solana.com',
        timeout: 60000,
      });

      const metaplexPluginKeypair = keypairIdentity(wallet);

      const metaplex = Metaplex.make(this.connection)
        .use(metaplexPluginBundlr)
        .use(metaplexPluginKeypair);

      this.logger.log(`Funding storage uploader`);

      const localBundlrStorage = metaplex
        .storage()
        .driver() as BundlrStorageDriver;

      (await localBundlrStorage.bundlr()).fund(1234);

      this.logger.log(`Uploading file to storage`);

      const fileUri = await metaplex
        .storage()
        .upload(
          toMetaplexFile(file.buffer, file.filename || file.originalname),
        );

      this.logger.log(`Uploading metadata to Arweave`);

      const { uri } = await metaplex
        .nfts()
        .uploadMetadata({
          name: 'Teste LEO',
          symbol: 'LEO',
          description: 'My description',
          seller_fee_basis_points: 1234,
          attributes: [
            {
              value: 'over 9000',
              trait_type: 'IQ',
            },
          ],
          properties: {
            creators: [
              {
                address: wallet.publicKey.toBase58(),
                share: 100,
                verified: true,
              },
            ],
            files: [
              {
                type: file.mimetype,
                uri: fileUri,
              },
            ],
          },
          image: fileUri,
        })
        .run();

      const nftInput: CreateNftInput = {
        name: 'Teste LEO',
        sellerFeeBasisPoints: 6900,
        symbol: 'LEO',
        uri,
        confirmOptions: {
          commitment: 'max',
        },

        creators: [
          {
            address: wallet.publicKey,
            share: 100,
            verified: true,
          },
        ],

        mintAuthority: wallet,
        updateAuthority: wallet,
        freezeAuthority: wallet.publicKey,

        owner: wallet.publicKey,
        payer: wallet,

        isMutable: true,
        // maxSupply: toBigNumber(1),
      };

      this.logger.log(`Creating NFT`);

      const { nft } = await metaplex.nfts().create(nftInput).run();

      return nft;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
