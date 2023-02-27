import { HydratedDocument, Schema, Types } from "mongoose"
import { WithdrawRequestStatus } from "src/utils/constants"
import { User } from "./user.model"

export class WithdrawRequest{
    _id? : String
    user? : String | User
    amount? : number
    phoneNumber? : String
    cashoutMethod? : String
    accountNumber? : String
    status : number
    dateCreated? : Date

    static ModelName = "WithdrawRequest"

    constructor(data : Partial<WithdrawRequest>){
        Object.assign(this, data);
    }
}

export type WithdrawRequestDocument = HydratedDocument<WithdrawRequest>

export const withdrawRequestSchema = new Schema<WithdrawRequest>({
    user : {type : Types.ObjectId , required : true},
    amount : {type  : Number , required : true},
    phoneNumber : {type : String , required : true},
    cashoutMethod : {type : String , required : true},
    accountNumber : {type : String},
    status : {type : Number , enum : WithdrawRequestStatus , default : WithdrawRequestStatus.PENDING},
    dateCreated : {type : Date , default : Date.now()}
})