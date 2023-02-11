
import mongoose, { HydratedDocument, Schema, Types } from "mongoose"
import { AccountType } from "src/utils/constants"
import { Address } from "./address.model"
import { Business } from "./business.model"
import { ServiceItem } from "./service_item.model"

export class User {
    _id? : String
    phoneNumber?: String
    username?: String
    password?: String
    accountType?: String
    favoriteBusinesses?: String[]
    favoriteService?: String
    dateCreate?: Date
    orders?: String[]
    addresses?: Address[]
    profileImage? : String;
    userBusinesses? : String[]
    favoriteProducts? : String[] | ServiceItem[]
    fcmToken? : String[]


    static ModelName = "User"
}

export var userSchema : Schema = new mongoose.Schema<User>({
    
    phoneNumber: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String },
    profileImage : {type : String},
    accountType: { type: String, enum: AccountType, default: AccountType.USER.toString() },
    favoriteBusinesses: { type: [Types.ObjectId] , ref : "Business" , default : [] },
    favoriteService: { type: Types.ObjectId },
    dateCreate: { type: Date },
    orders: { type: [Types.ObjectId], default: [] },
    userBusinesses : {type : [Types.ObjectId] , ref : "Business" , default : [] },
    favoriteProducts : {type : [Types.ObjectId] , ref : "ServiceItem" , default : []},
    fcmToken : {type : [String]},
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

  