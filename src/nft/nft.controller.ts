import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { NftService } from './nft.service';

@Controller('nft')
export class NftController {
  constructor(private readonly nftService: NftService) {}

  @Post('mint')
  @UseInterceptors(FileInterceptor('file'))
  async mintNft(@UploadedFile('file') file: Express.Multer.File) {
    return this.nftService.mintNft(file);
  }
}
