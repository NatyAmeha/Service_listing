import { HydratedDocument, Schema, Types } from "mongoose"
import { Address } from "./address.model"
import { Contact } from "./contact.model"
import { Coupon } from "./coupon.model"
import { Review } from "./review.model"
import { Service } from "./service.model"
import { SubscriptionPlan } from "./subscription_plan.model"
import { User } from "./user.model"

export class BusinessSubscription {
    subscriptionId?: Types.ObjectId | SubscriptionPlan | String
    startDate?: Date
    expireDate?: Date
}

export class Business {
    _id?: String
    name?: String
    description?: String
    category?: String[]
    likeCount?: number
    verified?: Boolean
    featured?: Boolean
    claimed? : Boolean
    type? : String // large_business, online_store,  freelancer
    services?: String[] | Service[]
    servicesName?: String[]
    coupons?: String[] | Coupon[]
    images?: String[]
    addresses?: Address[]
    contact?: Contact
    dateCreated?: Date 
    creator?: String
    reviews?: String[] | Review[] 
    subscription?: BusinessSubscription = {}

    static ModelName = "Business"

    constructor(data: Partial<Business>) {
        Object.assign(this, data);
    }
}

export var businessSchema: Schema = new Schema<Business>({
    name: { type: String, required: true , trim : true },
    description: { type: String, required: true , trim : true },
    category: { type: [String], required: true, uppercase: true },
    likeCount: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    claimed: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    services: { type: [Types.ObjectId], ref: "Service", default: [] },
    servicesName: { type: [String] },
    type: { type: String, required: true , trim : true },
    coupons: { type: [Types.ObjectId], ref: "Coupon", default: [] },
    images: { type: [String], required: true },
    dateCreated: { type: Date, default: Date.now() },
    creator: { type: Types.ObjectId, ref: "User" },
    reviews: { type: [Types.ObjectId], ref: "Review", default: [] },
    contact: {
        type: {
            email: { type: String , trim : true },
            phoneNumber: { type: [String] },
            links: { type: Map, of: String  }
        }
    },
    subscription: {
        type: {
            subscriptionId: { type: Types.ObjectId, required: true },
            startDate: { type: Date, default: Date.now() },
            expireDate: { type: Date, required: true }
        },
        required : false
    },
    addresses: [{
        type: {
            location: {
                type: { type: String, enum: ["Point"], required: false },
                coordinates: { type: [Number], required: false }
            },
            phoneNumber: { type: String },
            localAddress: { type: String , trim : true },
            mapLink : {type : String}
        },
        default: []
    }],
}).index({ "name": "text", "description": "text" })

export type BussinessDocument = HydratedDocument<Business>