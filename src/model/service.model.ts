import { HydratedDocument, Schema, Types } from "mongoose"
import { Address } from "./address.model"
import { Contact } from "./contact.model"
import { Coupon } from "./coupon.model"
import { Review } from "./review.model"
import { ServiceItem } from "./service_item.model"
import { User } from "./user.model"

export class Service {
    name?: String
    description?: String
    images?: String[]
    tags?: String[]
    viewCount?: number
    active?: Boolean
    creator?: String
    serviceItems: String[]
    addresses?: Address[]
    contact?: Contact
    coupons?: String[]
    dateCreated?: Date
    reviews?: String[]
    reviewPoints: String[]

    static ModelName = "Service"
}

export type ServiceDocument = HydratedDocument<Service>;

export var serviceSchema = new Schema<Service>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    images: { type: [String], required: true },
    tags: { type: [String], default: [] },
    viewCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    serviceItems: { type: [Types.ObjectId], ref: ServiceItem.ModelName },
    coupons: { type: [Types.ObjectId], ref: Coupon.ModelName },
    dateCreated: { type: Date, default: Date.now() },
    reviews: { type: [Types.ObjectId], ref: Review.ModelName },
    reviewPoints: { type: [String] },
    creator: { type: Types.ObjectId, ref: User.ModelName },
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
            phoneNumber: { type: String },
            localAddress: { type: String }
        },
        default: []
    }],
})