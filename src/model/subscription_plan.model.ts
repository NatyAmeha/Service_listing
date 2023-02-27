import { HydratedDocument, Schema } from "mongoose"
import { SubscriptionLevel, SubscriptionPlanType } from "src/utils/constants"

export class SubscriptionPlan {
    _id? : String
    name?: String
    price?: number
    level?: number
    features?: String[]
    planType?: SubscriptionPlanType | String
    dayLength: number
    active?: boolean

    static ModelName = "SubscriptionPlan"
}

export type  SubscriptionDocument = HydratedDocument<SubscriptionPlan>;

export const  subscriptionSchema = new Schema<SubscriptionPlan>({
    name : {type : String , required : true},
    price : {type : Number , required : true},
    level : {type : Number , default : 0 , enum : SubscriptionLevel},
    features : {type : [String] , required : true},
    planType : {type : String , enum : SubscriptionPlanType},
    dayLength : {type : Number , default : 30},
    active : {type : Boolean , default : true}

})