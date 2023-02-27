import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"

import { SubscriptionPlan, SubscriptionDocument } from "src/model/subscription_plan.model"
import { MongodbRepo } from "./mongodb.repo"
import { IRepository } from "./repo.interface"

export interface ISubscriptionRepo extends IRepository<SubscriptionPlan> { }

@Injectable()
export class SubscriptionRepository extends MongodbRepo<SubscriptionDocument> implements ISubscriptionRepo {
    static injectName = "SUBSCRIPTION_REPOSITORY"
    constructor(@InjectModel(SubscriptionPlan.ModelName) protected subscriptionModel: Model<SubscriptionDocument>) {
        super(subscriptionModel)
    }
}