import {
  bundlrStorage,
  BundlrStorageDriver,
  CreateNftInput,
  keypairIdentity,
  Metaplex,
  toBigNumber,
  toMetaplexFile,
  UploadMetadataInput,
} from '@metaplex-foundation/js';
import { Injectable, Logger } from '@nestjs/common';
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { AccountService } from 'src/account/account.service';
import { WalletService } from 'src/wallet/wallet.service';

@Injectable()
export class NftService {
  private readonly logger = new Logger(NftService.name);
  private readonly cluster = clusterApiUrl('devnet');
  private readonly commitment = 'confirmed';
  private readonly connection = new Connection(this.cluster, this.commitment);

  constructor(
    private readonly walletService: WalletService,
    private readonly accountService: AccountService,
  ) {}

  async mintPOC(file: Express.Multer.File, metadata: UploadMetadataInput) {
    try {
      this.logger.log(`POC - Mint`);

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

      // private metaplex = new Metaplex(this.connection)

      const metaplex = Metaplex.make(this.connection)
        .use(metaplexPluginBundlr)
        .use(metaplexPluginKeypair);

      // this.logger.log(`Funding storage uploader`);

      // const localBundlrStorage = metaplex
      //   .storage()
      //   .driver() as BundlrStorageDriver;

      // (await localBundlrStorage.bundlr()).fund(1234);

      this.logger.log(`Uploading file to storage`);

      const price = await metaplex
        .storage()
        .getUploadPriceForFile(
          toMetaplexFile(file.buffer, file.filename || file.originalname),
        );

      this.logger.log(
        `Price for uploading file: ${price.basisPoints.toNumber()} lamports`,
      );

      const fileUri = await metaplex
        .storage()
        .upload(
          toMetaplexFile(file.buffer, file.filename || file.originalname),
        );

      this.logger.log(`Uploading metadata to Arweave`);

      const metadata: UploadMetadataInput = {
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
      };

      this.logger.log(
        `Size of metadata: ${
          new TextEncoder().encode(JSON.stringify(metadata)).byteLength
        }`,
      );

      const uploadMetadataResponse = await metaplex
        .nfts()
        .uploadMetadata(metadata)
        .run();

      return {
        uploadMetadataResponse,
      };

      // return this.estimateMintCosts([file.size, 434]);
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  private async estimateMintCosts(
    fileSizesToBeUploaded: number[] = [],
    numberOfTransfers = 0,
  ) {
    this.logger.log('Estimating costs for mint tx');

    const responseData =
      await this.accountService.getMinimumBalanceForRentExemption({
        shouldCheckAccount: true,
        shouldCheckMint: true,
        // customByteLengthArray: fileSizesToBeUploaded,
      });

    const metaplex = new Metaplex(this.connection);

    const promises = fileSizesToBeUploaded.map((fileSize) =>
      metaplex.storage().getUploadPriceForBytes(fileSize),
    );

    const values = await Promise.all(promises);

    const totalRentExemptCosts = Object.keys(responseData).reduce(
      (previous, key) => {
        return previous + responseData[key].value.lamports;
      },
      0,
    );

    const totalUploadCosts = values.reduce((acc, value) => {
      return acc + value.basisPoints.toNumber();
    }, 0);

    const totalTransactionGasFees = new Metaplex(this.connection)
      .utils()
      .estimateTransactionFee(numberOfTransfers)
      .basisPoints.toNumber();

    return totalRentExemptCosts + totalUploadCosts + totalTransactionGasFees;
  }

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

      // private metaplex = new Metaplex(this.connection)

      const metaplex = Metaplex.make(this.connection)
        .use(metaplexPluginBundlr)
        .use(metaplexPluginKeypair);

      const localBundlrStorage = metaplex
        .storage()
        .driver() as BundlrStorageDriver;

      const bundlr = await localBundlrStorage.bundlr();

      this.logger.log(`Bundlr addres: ${bundlr.address}`);

      this.logger.log(
        `Initial storage balance: ${(
          await localBundlrStorage.getBalance()
        ).basisPoints.toNumber()} lamports`,
      );

      const lamportsToFund = LAMPORTS_PER_SOL / 10;

      this.logger.log(`Funding storage with ${lamportsToFund} lamports`);

      await localBundlrStorage.fund({
        basisPoints: toBigNumber(lamportsToFund),
        currency: { decimals: 9, symbol: 'SOL' },
      });

      this.logger.log(
        `Storage balance after funding: ${await (
          await localBundlrStorage.getBalance()
        ).basisPoints.toNumber()} lamports`,
      );

      this.logger.log(`Uploading file to storage`);

      const metaplexFile = toMetaplexFile(
        file.buffer,
        file.filename || file.originalname,
      );

      const price = await metaplex
        .storage()
        .getUploadPriceForFile(metaplexFile);

      this.logger.log(
        `Price for uploading file: ${price.basisPoints.toNumber()} lamports`,
      );

      console.time('upload_file');

      const fileUri = await metaplex.storage().upload(metaplexFile);

      console.timeEnd('upload_file');

      this.logger.log(
        `Storage balance after uploading file: ${(
          await localBundlrStorage.getBalance()
        ).basisPoints.toNumber()} lamports`,
      );

      this.logger.log(`Uploading metadata to Arweave`);

      const metadata: UploadMetadataInput = {
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
      };

      this.logger.log(
        `Size of metadata: ${
          new TextEncoder().encode(JSON.stringify(metadata)).byteLength
        } bytes`,
      );

      const price2 = await metaplex
        .storage()
        .getUploadPriceForFile(
          toMetaplexFile(
            new TextEncoder().encode(JSON.stringify(metadata)).buffer,
            'metadata.json',
          ),
        );

      this.logger.log(
        `Price for uploading metadata: ${price2.basisPoints.toNumber()} lamports`,
      );

      console.time('upload_metadata');

      const { uri } = await metaplex.nfts().uploadMetadata(metadata).run();

      console.timeEnd('upload_metadata');

      this.logger.log(
        `Storage balance after uploading metadata: ${await (
          await localBundlrStorage.getBalance()
        ).basisPoints.toNumber()} lamports`,
      );

      const nftInput: CreateNftInput = {
        name: metadata.name,
        sellerFeeBasisPoints: metadata.seller_fee_basis_points,
        symbol: metadata.symbol,
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

      console.time('mint');

      const { nft } = await metaplex.nfts().create(nftInput).run();

      console.timeEnd('mint');

      this.logger.log(`NFT Created!`);

      await localBundlrStorage.withdrawAll();

      this.logger.log(`Funds have been withdrawn from storage`);

      return nft;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
