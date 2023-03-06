import { HydratedDocument, Schema, Types } from "mongoose"
import { TransactionAction } from "src/utils/constants"
import { Order } from "./order.model"
import { ServiceItem } from "./service_item.model"

export class Transaction{
    _id? : String
    amount? : number
    source? : String     // wallet address of the source of transaction
    sourceName? : String
    recepient? : String   // wallet address of the recepient
    recepientName? : String
    status? : String  // including pending, verified
    action? : string
    description? : String
    type? : number  // inclucing donation , product purchase,  recharge , cashout
    service? : String
    product? : String | ServiceItem
    order? : String | Order

    dateCreated? : Date

    static ModelName = "Transaction"

    constructor(data : Partial<Transaction>){
        Object.assign(this, data);
    }
}

export type TransactionDocument = HydratedDocument<Transaction>

export const transactionSchema = new Schema<Transaction>({
    amount : {type : Number , required : true , validate : (value : Number) => value > 0},
    source : {type : String},
    sourceName : {type : String }, 
    recepient : {type : String },  // it can be null for instance when user made a purchase
    recepientName : {type : String , required : true},   
    status : {type : String , required : true },  
    action : {type : String , enum : TransactionAction},
    description : {type : String}, 
    type : {type : Number , required : true },
    service : {type : Types.ObjectId , ref : "Service"},
    product : {type : Types.ObjectId , ref : "ServiceItem"},
    order : {type : Types.ObjectId , ref : "Order"},
    dateCreated : {type : Date , default : Date.now()}
})