import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { WithdrawRequest, WithdrawRequestDocument } from "src/model/withdraw_request.mode"
import { MongodbRepo } from "./mongodb.repo"
import { IRepository } from "./repo.interface"

export interface IWithdrawRequestRepo extends IRepository<WithdrawRequest> { }

@Injectable()
export class WithdrawRequestRepository extends MongodbRepo<WithdrawRequestDocument> implements IWithdrawRequestRepo {
    static injectName = "WITHDRAW_REQUEST_REPOSITORY"
    constructor(@InjectModel(WithdrawRequest.ModelName) protected subscriptionModel: Model<WithdrawRequestDocument>) {
        super(subscriptionModel)
    }
}