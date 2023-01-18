
import { HydratedDocument, Schema, Types } from "mongoose"
import { Business } from "./business.model"
import { Service } from "./service.model"

export class ServiceItem {
    name?: String
    description?: String
    images?: String[]
    moreInfo?: Map<String, String>
    service?: String
    business? : String
    category?: String
    tags?: String[]
    fixedPrice?: number
    minPrice?: number
    maxPrice?: number
    maxCount?: number
    likeCount?: number
    viewCount?: number
    featured?: Boolean
    callToAction?: String
    expireDate?: Date
    variants?: ServiceItemVariant[]
    dateCreated?: Date

    static ModelName = "ServiceItem"

}

export class ServiceItemVariant {
    images?: String[]
    moreInfo?: Map<String, String>
    fixedPrice?: number
    minPrice?: number
    maxPrice?: number
}

export type ServiceItemDocument = HydratedDocument<ServiceItem>;

export var serviceItemSchema: Schema = new Schema<ServiceItem>({
    name: { type: String, required: true },
    description: { type: String },
    images: { type: [String], required: true },
    moreInfo: { type: Map, of: String },
    service: { type: Types.ObjectId, required: true , ref : Service.ModelName },
    business : { type: Types.ObjectId, required: true , ref : Business.ModelName },
    category: { type: String },
    tags: { type: [String] },
    fixedPrice: { type: Number },
    minPrice: {
        type: Number, required: (): boolean => {
            const item = this as ServiceItem
            return item.fixedPrice == undefined;
        }
    },
    maxPrice: {
        type: Number, required: (): boolean => {
            const item = this as ServiceItem
            return item.fixedPrice == undefined;
        }
    },
    maxCount: { type: Number },
    likeCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    callToAction: { type: String, required: true },
    expireDate: { type: Date },
    dateCreated: { type: Date, default: Date.now() },
    variants: [{
        type: {
            images: { tyep: [String], required: true },
            moreInfo: { type: Map, of: String },
            fixedPrice: { type: Number },
            minPrice: {
                type: Number, required: (): boolean => {
                    const item = this as ServiceItem
                    return item.fixedPrice == undefined;
                }
            },
            maxPrice: {
                type: Number, required: (): boolean => {
                    const item = this as ServiceItem
                    return item.fixedPrice == undefined;
                }
            },
        }
    }]
})