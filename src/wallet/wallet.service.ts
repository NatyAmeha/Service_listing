import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { rest, result } from 'lodash';
import { ClientSession } from 'mongoose';
import { OrderDTO } from 'src/dto/order.dto';
import { ServiceDTO } from 'src/dto/service.dto';
import { ProductDTO } from 'src/dto/service_item.dto';
import { TransactionDTO } from 'src/dto/transaction.dto';
import { Order } from 'src/model/order.model';
import { Service } from 'src/model/service.model';
import { ServiceItem } from 'src/model/service_item.model';
import { Transaction } from 'src/model/transaction.model';
import { Wallet } from 'src/model/wallet.model';
import { WithdrawRequest } from 'src/model/withdraw_request.mode';
import { TransactionRepository } from 'src/repo/transaction.repo';
import { WalletRepository } from 'src/repo/wallet.repo';
import { IWithdrawRequestRepo, WithdrawRequestRepository } from 'src/repo/withdraw_request.repo';
import { TransactionStatus, TransactionType, WithdrawRequestStatus } from 'src/utils/constants';
import { ErrorHandler } from 'src/utils/error.util';
import { Helper, IHelper } from 'src/utils/helper';

@Injectable()
export class WalletService {

    constructor(
        @Inject(WalletRepository.injectName) private walletRepo: WalletRepository,
        @Inject(TransactionRepository.injectName) private transactionRepo: TransactionRepository,
        @Inject(WithdrawRequestRepository.injectName) private withdrawRequestRepo: IWithdrawRequestRepo,
        @Inject(Helper.INJECT_NAME) helper: IHelper,
    ) { }


    async createWallet(walletInfo: Wallet, trInfo: Transaction, session: ClientSession): Promise<Boolean> {
        this.walletRepo.addSession(session)
        this.transactionRepo.addSession(session)


        if (walletInfo.owner) {
            this.walletRepo.addSession(session)
            this.transactionRepo.addSession(session)
            var walletREsult = await this.walletRepo?.add(walletInfo)
            var fullTrInfo: Transaction = {
                ...trInfo, recepient: walletREsult?.address, type: TransactionType.REWARD,
                status: TransactionStatus.APPROVED, amount: 50
            }
            var transactionCreateResult = await this.transactionRepo.add(fullTrInfo)
            if (transactionCreateResult) {
                return true
            }
            else {
                return false
            }
        }
        else {
            return Promise.reject(false)
        }


    }

    async getWalletBalance(userId: String): Promise<number> {
        var result = await this.walletRepo.getWalletBalance(userId)
        return result
    }

    async sendRewardToWallet(userId: String, amount: number, trInfo: Transaction, session: ClientSession) {
        this.walletRepo.addSession(session)
        this.transactionRepo.addSession(session)
        var userWallet = await this.walletRepo?.findOne({ owner: userId })
        if (userWallet) {
            var fullTransactionInfo: Transaction = {
                ...trInfo,
                amount: amount,
                recepient: userWallet.address,
                status: TransactionStatus.APPROVED
            }
            var transactionId
            if (fullTransactionInfo._id == null) {
                var trCreateResult = await this.transactionRepo.add(fullTransactionInfo, false)
                transactionId = trCreateResult._id
            }
            else {
                var trUpdateResult = await this.transactionRepo.update({ _id: fullTransactionInfo._id }, fullTransactionInfo)
                transactionId = fullTransactionInfo._id
            }

            var walletUpdate = await this.walletRepo.updateWithFilter({ address: userWallet.address },
                { $inc: { balance: +amount }, $push: { transactions: transactionId } })
            return true

        }
        else return Promise.reject(new BadRequestException("", "unable to find the wallet"))
    }

    async requestCashout(cashoutInfo: WithdrawRequest) {
        try {
            var isTherePendingCashoutRequest = await this.withdrawRequestRepo.findOne({ user: cashoutInfo.user, status: WithdrawRequestStatus.PENDING })

            if (isTherePendingCashoutRequest == null) {
                var canCashout = await this.walletRepo!!.canCashoutFromWallet(cashoutInfo.user as String, cashoutInfo.amount || 0)
                if (canCashout) {
                    var result = await this.withdrawRequestRepo.add(cashoutInfo)
                    return result
                }
            }
            else return Promise.reject(new BadRequestException(ErrorHandler.CASHOUT_DUPLICATE_REQUEST_ERROR, ErrorHandler.CASHOUT_DUPLICATE_REQUEST_ERROR))

        } catch (ex) {
            return Promise.reject(ex)
        }
    }

    // async cashout(amount: number, walletOwner: String, method: number) : Promise<Boolean> {
    //     try {
    //         var canCashout = await this.walletPayment!!.canCashoutFromWallet(walletOwner, amount)
    //         if (canCashout) {
    //             var result = await this.walletPayment!!.cashout(amount, walletOwner, method)
    //             return result
    //         }
    //         else return false
    //     } catch (ex) {
    //         return Promise.reject(ex)
    //     }

    // }



    // async buyProductWithWallet(amount: number, userId: String, trInfo: ITransaction) {
    //     var result = await this.walletPayment?.pay(amount, userId, trInfo)
    // }

    // async rechargeWallet(amount: number, userId: String, trInfo: ITransaction, vendor: IPaymentVendor): Promise<Boolean> {
    //     //verify vendor payments
    //     var result = await vendor.verifyPayment('payment identifier')
    //     // recharge wallet 
    //     if (result == true) return await this.walletPayment!!.rechargeWallet(amount, userId, trInfo, vendor)
    //     else return Promise.reject(false)
    // }

    async getWalletTransaaction(userId: String): Promise<TransactionDTO[]> {
        var walletInfo = await this.walletRepo.findOne({ owner: userId })
        var result = await this.transactionRepo.find({
            $or: [
                { source: walletInfo?.address }, { source: userId }, { recepient: walletInfo?.address }, { recepient: userId },
            ]
        }, ["service", "product"])
        var transactionDTOResult = result.map(transaction => {
            const { service, product, ...rest } = transaction
            return new TransactionDTO({
                transaction: rest,
                service: new ServiceDTO({ service: service as Service }),
                product: new ProductDTO({ serviceItem: product as ServiceItem }),
            })
        })
        return transactionDTOResult
    }

    async getTransactionDetail(transactionId: String): Promise<TransactionDTO> {
        var trResult = await this.transactionRepo.get(transactionId, ["service", "product", "order"]);
        const { service, product, order, ...rest } = trResult
        

        return new TransactionDTO({
            transaction: rest,
            service: new ServiceDTO({ service: service as Service }),
            product: new ProductDTO({ serviceItem: product as ServiceItem }),
            orderInfo: new OrderDTO({ order: order as Order })
        })
    }

    async getTransactionsRelatedToOrder(orderId: String): Promise<TransactionDTO[]> {
        var transactions = await this.transactionRepo.find({ order: orderId, status: TransactionStatus.PENDING }, ["service", "product" , "order"])
        var result = transactions.map(transaction => {
            const { service, product, order, ...rest } = transaction
            return new TransactionDTO({
                transaction: rest,
                service: new ServiceDTO({ service: service as Service }),
                product: new ProductDTO({ serviceItem: product as ServiceItem }),
                orderInfo: new OrderDTO({ order: order as Order })
            })
        })
        return result
    }

    async getPendingCashoutRequest(userId: String): Promise<WithdrawRequest | null> {
        var pendingRequest = await this.withdrawRequestRepo.findOne({ user: userId })
        if (pendingRequest) {
            return pendingRequest
        }
        else return null;

    }



}
