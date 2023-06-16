import { HydratedDocument, Schema, Types } from "mongoose"
import { Address } from "./address.model"
import { Business } from "./business.model"
import { Contact } from "./contact.model"
import { Coupon } from "./coupon.model"
import { Review } from "./review.model"
import { ServiceItem } from "./service_item.model"
import { User } from "./user.model"
import { OrderType, ServiceItemType } from "src/utils/constants"

export class Service {
    _id?: String
    name?: String
    description?: String
    business?: String | Business
    businessName?: String
    fixedPrice?: number
    type? : String
    minPrice?: number
    maxPrice?: number
    images?: String[]
    tags?: String[]
    viewCount?: number
    active?: Boolean
    creator?: String | User
    callToAction?: String
    serviceItems?: String[] | ServiceItem[]
    addresses?: Address[]
    contact?: Contact
    coupons?: String[] | Coupon[]
    dateCreated?: Date
    reviews?: String[] | Review[]
    reviewPoints?: String[]

    static ModelName = "Service"

    constructor(data: Partial<Service>) {
        Object.assign(this, data);
    }
}

export type ServiceDocument = HydratedDocument<Service>;

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0MWFjZDJjOGExYTUxYTUyYWJjMGY2NyIsInVzZXJuYW1lIjoiR2FzdCBFbnRlcnRhaW5tZW50IiwiYWNjb3VudFR5cGUiOiJTRVJWSUNFX1BST1ZJREVSIiwiaWF0IjoxNjc5NTA1MTY4LCJleHAiOjE2ODIwOTcxNjh9.0KrQ9CvSSB8tJCbfJwN0wmxRQbP4AZ_aoatY4qq68rs

export var serviceSchema = new Schema<Service>({
    name: { type: String, required: true, trim : true },
    description: { type: String, trim : true },
    images: { type: [String], required: true },
    callToAction: { type: String, trim : true },
    business: { type: Types.ObjectId, ref: "Business" },
    businessName: { type: String, required: true , trim : true},
    type : {type : String , enum : ServiceItemType},
    tags: { type: [String], default: [] },
    viewCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    serviceItems: { type: [Types.ObjectId], ref: "ServiceItem", default: [] },
    coupons: { type: [Types.ObjectId], ref: "Coupon" },
    dateCreated: { type: Date, default: Date.now() },
    reviews: { type: [Types.ObjectId], ref: "Review", default: [] },
    reviewPoints: { type: [String] },
    creator: { type: Types.ObjectId, ref: "User" },
    fixedPrice: { type: Number },
    minPrice: {
        type: Number
    },
    maxPrice: {
        type: Number,
    },
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
            mapLink: { type: String },
            localAddress: { type: String }
        },
        default: []
    }],
}).index({ "name": "text", "tags": "text" })