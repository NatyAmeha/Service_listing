import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { Transaction, TransactionDocument } from "src/model/transaction.model"
import { MongodbRepo } from "./mongodb.repo"
import { IRepository } from "./repo.interface"

export interface ITransactionRepo extends IRepository<Transaction> { }

@Injectable()
export class TransactionRepository extends MongodbRepo<TransactionDocument> implements ITransactionRepo {
    static injectName = "TRANSACTION_REPOSITORY"
    constructor(@InjectModel(Transaction.ModelName) protected subscriptionModel: Model<TransactionDocument>) {
        super(subscriptionModel)
    }
}