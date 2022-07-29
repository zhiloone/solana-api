import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { validate } from './config/env.validation';
import { TokenProgramModule } from './token-program/token-program.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    TokenProgramModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
