import { InternalServerErrorException } from "@nestjs/common/exceptions"
import { NextFunction } from "express"
import { HydratedDocument, Schema, Types } from "mongoose"
import { v4 } from "uuid"
import { Transaction } from "./transaction.model"
import { User } from "./user.model"

export class Wallet {
    _id?: String
    address?: String
    balance?: number
    created?: Date

    transactions?: Transaction[] | String[]
    owner?: String | User

    static ModelName = "Wallet" 

    constructor(data : Partial<Wallet>){
        Object.assign(this, data);
    }

}

export type WalletDocument = HydratedDocument<Wallet>;

export const walletSchema = new Schema<Wallet>({
    address: { type: String, required: true },
    balance: { type: Number, default: 50 },
    created: { type: Date, default: Date.now() },
    transactions : {type : [Types.ObjectId] , ref : "Transaction"},
    owner: { type: Types.ObjectId, required: true, ref: "User" }
})

walletSchema.pre('save', function (next: NextFunction) {
    if (this.address && this.isModified("address")){
        var uId = v4()
        var uniqueAddress = `wallet://${this.address}${uId}`
        this.address = uniqueAddress
        next()
    }
    else next(new InternalServerErrorException('DB', 'unable to create unique address for wallet'))
   
})