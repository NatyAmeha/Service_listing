
import { HydratedDocument, Schema, Types } from "mongoose"
import { Constants, ServiceItemType } from "src/utils/constants"
import { Business } from "./business.model"
import { Service } from "./service.model"


export class ServiceItem {
    _id?: String
    name?: String
    description?: String
    images?: String[]
    type? : String   // SERVICE OR PRODUCT
    moreInfo?: Map<String, String>
    service?: String | Service

    business?: String | Business
    businessName?: String
    serviceName?: String
    category?: String
    tags?: String[]
    fixedPrice?: number
    minPrice?: number
    maxPrice?: number
    maxAmount?: number
    likeCount?: number
    viewCount?: number
    featured?: Boolean
    callToAction?: String
    expireDate?: Date
    canOrder?: boolean
    variants?: ServiceItemVariant[]
    dateCreated?: Date
    requireDate? : boolean  // control weather user must pick a date for booking or purchase

    static ModelName = "ServiceItem"

}

export class ServiceItemVariant {
    images?: String[]
    moreInfo?: Map<String, String>
    fixedPrice?: number

}

export type ServiceItemDocument = HydratedDocument<ServiceItem>;

export var serviceItemSchema = new Schema<ServiceItem>({
    name: { type: String, required: true },
    description: { type: String },
    images: { type: [String], required: true },
    moreInfo: { type: Map, of: String },
    type : {type : String , required : true , enum : ServiceItemType},
    service: { type: Types.ObjectId, required: true, ref: "Service" },
    serviceName: { type: String, required: true },
    business: { type: Types.ObjectId, required: true, ref: "Business" },
    businessName: { type: String, required: true },
    category: { type: String , required : true },
    tags: { type: [String] },
    fixedPrice: { type: Number, required: true },
    minPrice: {
        type: Number, required: function (): boolean {
            const item = this as ServiceItem
            console.log("fixed price", item.fixedPrice)
            return item.fixedPrice == undefined;
        }
    },
    maxPrice: {
        type: Number, required: function (): boolean {
            const item = this as ServiceItem
            return item.fixedPrice == undefined;
        }
    },
    maxAmount: { type: Number },
    likeCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    callToAction: { type: String, required: true },
    canOrder: { type: Boolean, default: true },
    expireDate: { type: Date },
    dateCreated: { type: Date, default: Date.now() },
    requireDate : {type : Boolean , default : false},
    variants: [{
        type: {
            images: { type: [String] },
            moreInfo: { type: Map, of: String },
            fixedPrice: { type: Number, required: true },


        }
    }]
}).index({ "name": "text", "description": "text", "businessName" : "text" , "serviceName" : "text" , "tags": "text" })


