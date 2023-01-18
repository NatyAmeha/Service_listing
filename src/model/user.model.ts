
import mongoose, { HydratedDocument, Schema, Types } from "mongoose"
import { AccountType } from "src/utils/constants"
import { Address } from "./address.model"

export class User {
    _id : String
    phoneNumber?: String
    username?: String
    password?: String
    accountType?: String
    favoriteBusiness?: String
    favoriteService?: String
    dateCreate?: Date
    orders?: String[]
    addresses?: Address[]

    static ModelName = "User"
}

export var userSchema : Schema = new mongoose.Schema<User>({
    
    phoneNumber: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String },
    accountType: { type: String, enum: AccountType, default: AccountType.USER.toString() },
    favoriteBusiness: { type: Types.ObjectId },
    favoriteService: { type: Types.ObjectId },
    dateCreate: { type: Date },
    orders: { type: [Types.ObjectId], default: [] },
    addresses: [{
        type: {
            location: {
                type: { type: String, enum: ["Point"], required: false },
                coordinates: { type: [Number], required: false }
            },
            phoneNumber: { type: String },
            localAddress: { type: String }
        },
        default: []
    }],
})

export type UserDocument = HydratedDocument<User>;

