import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { AdminController } from './admin.controller';

@Module({
  imports : [WalletModule,
  AuthModule,],
  controllers: [AdminController]
})
export class AdminModule {}
