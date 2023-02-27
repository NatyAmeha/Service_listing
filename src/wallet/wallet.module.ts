import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, transactionSchema } from 'src/model/transaction.model';
import { Wallet, walletSchema } from 'src/model/wallet.model';
import { WithdrawRequest, withdrawRequestSchema } from 'src/model/withdraw_request.mode';
import { TransactionRepository } from 'src/repo/transaction.repo';
import { WalletRepository } from 'src/repo/wallet.repo';
import { WithdrawRequestRepository } from 'src/repo/withdraw_request.repo';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Wallet.ModelName, schema: walletSchema },
      { name: Transaction.ModelName, schema: transactionSchema },
      {name : WithdrawRequest.ModelName , schema : withdrawRequestSchema}
    ])
  ],
  controllers: [WalletController],
  providers: [
    {
      provide: WalletRepository.injectName,
      useClass: WalletRepository,
    },
    {
      provide: TransactionRepository.injectName,
      useClass: TransactionRepository
    },
    {
      provide : WithdrawRequestRepository.injectName,
      useClass : WithdrawRequestRepository
    },
    WalletService,
  ],
  exports : [
    WalletRepository.injectName,
    TransactionRepository.injectName,
    WalletService
  ]
})
export class WalletModule { }
