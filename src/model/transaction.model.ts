import { HydratedDocument, Schema } from "mongoose"

export class Transaction{
    _id? : String
    amount? : number
    source? : String     // wallet address of the source of transaction
    sourceName? : String
    recepient? : String   // wallet address of the recepient
    recepientName? : String
    status? : number  // including pending, verified
    description? : String
    type? : number  // inclucing donation , product purchase,  recharge , cashout
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
    status : {type : Number , required : true },  
    description : {type : String}, 
    type : {type : Number , required : true },
    dateCreated : {type : Date , default : Date.now()}
})