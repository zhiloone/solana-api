import {
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { NftService } from './nft.service';

@Controller('nft')
export class NftController {
  constructor(private readonly nftService: NftService) {}

  @Post('poc')
  @UseInterceptors(FileInterceptor('file'))
  async mintPOC(
    @Req() req: Request,
    @UploadedFile('file') file: Express.Multer.File,
  ) {
    return this.nftService.mintPOC(file, JSON.parse(req.body.metadata));
  }

  @Post('mint')
  @UseInterceptors(FileInterceptor('file'))
  async mintNft(@UploadedFile('file') file: Express.Multer.File) {
    return this.nftService.mintNft(file);
  }
}
