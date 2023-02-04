import { HydratedDocument, Schema, Types } from "mongoose"
import { Address } from "./address.model"
import { Business } from "./business.model"
import { Contact } from "./contact.model"
import { Coupon } from "./coupon.model"
import { Review } from "./review.model"
import { ServiceItem } from "./service_item.model"
import { User } from "./user.model"

export class Service {
    _id? : String
    name?: String
    description?: String
    business? : String | Business
    businessName? : String
    images?: String[]
    tags?: String[]
    viewCount?: number
    active?: Boolean
    creator?: String
    callToAction?: String
    serviceItems?: String[] | ServiceItem[]
    addresses?: Address[]
    contact?: Contact 
    coupons?: String[] | Coupon[]
    dateCreated?: Date
    reviews?: String[] | Review[]
    reviewPoints?: String[]

    static ModelName = "Service"
}

export type ServiceDocument = HydratedDocument<Service>;

export var serviceSchema = new Schema<Service>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    images: { type: [String], required: true },
    callToAction : {type : String},
    business: { type: Types.ObjectId, ref: "Business" },
    businessName : {type : String , required : true},
    tags: { type: [String], default: [] },
    viewCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    serviceItems: { type: [Types.ObjectId], ref: "ServiceItem" , default : [] },
    coupons: { type: [Types.ObjectId], ref: "Coupon" },
    dateCreated: { type: Date, default: Date.now() },
    reviews: { type: [Types.ObjectId], ref: "Review" , default : [] },
    reviewPoints: { type: [String] },
    creator: { type: Types.ObjectId, ref: "User" },
    contact: {
        type: {
            email: { type: String },
            phoneNumber: { type: [String] },
            links: { type: Map, of: String }
        }
    },
    addresses: [{
        type: {
            location: {
                type: { type: String, enum: ["Point"], required: false },
                coordinates: { type: [Number], required: false }
            },
            
            localAddress: { type: String }
        },
        default: []
    }],
}).index({"name" : "text" , "description" : "text" , "tags" : "text" })