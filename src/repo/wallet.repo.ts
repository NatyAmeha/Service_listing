import { BadRequestException, Inject, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { Wallet, WalletDocument } from "src/model/wallet.model"
import { AMOUNT_LEFT_AFTER_CASHOUT, ELIGABLE_AMOUNT_FOR_CASH_OUT as MIN_ELIGABLE_AMOUNT_FOR_CASH_OUT, TransactionType } from "src/utils/constants"
import { ErrorHandler } from "src/utils/error.util"
import { MongodbRepo } from "./mongodb.repo"
import { IRepository } from "./repo.interface"
import { TransactionRepository } from "./transaction.repo"

export interface IWalletRepo extends IRepository<Wallet> { }

@Injectable()
export class WalletRepository extends MongodbRepo<WalletDocument> implements IWalletRepo {
    static injectName = "WALLET_REPOSITORY"
    constructor(@InjectModel(Wallet.ModelName) protected subscriptionModel: Model<WalletDocument>,
        @Inject(TransactionRepository.injectName) private transactionRepo: TransactionRepository,) {
        super(subscriptionModel)
    }

    async getWalletBalance(userId : String){
        var walletInfo = await this.findOne({ owner: userId })
        if(walletInfo){
            var trRecords = await this.transactionRepo.find({ $or: [{ source: walletInfo?.address }, { recepient: walletInfo?.address }] })
            console.log(walletInfo , trRecords)
            
            var totalAmount : number = 0
            trRecords.forEach(tr =>{
                if(tr.type == TransactionType.DEPOSIT) totalAmount += tr.amount!!
                else if(tr.type == TransactionType.REWARD) totalAmount += tr.amount!!
                else if(tr.type == TransactionType.DISCOUNTCASHBACK) totalAmount += tr.amount!!
               else if(tr.type == TransactionType.CASHBACK) totalAmount += tr.amount!!
                else if(tr.type == TransactionType.PURCHASE) totalAmount -= tr.amount!!
                else if(tr.type == TransactionType.WITHDRAWAL) totalAmount -= tr.amount!!
                
            })
            console.log("balance" , walletInfo?.balance , "verified" , totalAmount)
            return totalAmount 
            
        }
        else{
            // return Promise.reject(new BadRequestException("", "Unable to find wallet for this user"))
            return 0
        } 
    }

    async canCashoutFromWallet(userId : String , amount : number){
        var walletBalance = await this.getWalletBalance(userId)
        console.log(walletBalance , amount)
        if(amount <= 0){
            return Promise.reject(new BadRequestException(ErrorHandler.CASHOUT__REQUEST_AMOUNT_0_ERROR , ErrorHandler.CASHOUT__REQUEST_AMOUNT_0_ERROR))
        }
        else if (walletBalance < amount) {
            return Promise.reject(new BadRequestException(ErrorHandler.CASHOUT__REQUEST_INSUFFIIENT_BALANCE , ErrorHandler.CASHOUT__REQUEST_INSUFFIIENT_BALANCE))
        }

        else if (walletBalance < MIN_ELIGABLE_AMOUNT_FOR_CASH_OUT) {
            return Promise.reject(new BadRequestException(ErrorHandler.CASHOUT_REQUEST_ELIGABLITY_ERROR , ErrorHandler.CASHOUT_REQUEST_ELIGABLITY_ERROR))
        }

        else if ((walletBalance - amount) <= AMOUNT_LEFT_AFTER_CASHOUT) {
            return Promise.reject(new BadRequestException(ErrorHandler.CASHOUT_REQUEST_ERROR_AMOUNT_MUST_BE_LEFT, ErrorHandler.CASHOUT_REQUEST_ERROR_AMOUNT_MUST_BE_LEFT))
        }
        else return true
    }
}