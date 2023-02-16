import { HydratedDocument, Schema, Types } from "mongoose"
import { CouponType } from "src/utils/constants"
import { Business } from "./business.model"
import { Service } from "./service.model"


export class Coupon {
    _id?: String
    name?: String
    description?: String
    images?: String[]
    couponType?: String
    startDate?: Date
    endDate?: Date
    maxAmount?: number
    totalUsed? : number
    discountAmount? : number
    businessName?: String
    serviceName?: String
    business?: String | Business
    service?: String[] | Service[]
    couponCodes?: CouponCode[]
    isActive?: Boolean
    dateCreated?: Date
    creator?: String

    static ModelName = "Coupon"

    constructor(data : Partial<Coupon>){
        Object.assign(this, data);
    }

}

export class CouponCode {
    _id? : String
    value?: String
    used?: Boolean
    user?: String

    constructor(data : Partial<CouponCode>){
        Object.assign(this, data);
    }
}

export type CouponDocument = HydratedDocument<Coupon>;

export var couponSchema = new Schema<Coupon>({ 
    name: { type: String, required: true },
    description: { type: String },
    images: { type: [String], required: true },
    couponType: { type: String, required: true, enum: CouponType },
    maxAmount: {
        type: Number, required: function (): boolean {
            const item = this as Coupon
            return item.startDate == null;
        }
    },
    totalUsed: {type: Number , default : 0},

    discountAmount :{type : Number , default : 10},
    startDate: { type: Date },
    endDate: {
        type: Date, required: function (): boolean {
            const item = this as Coupon
            return item.startDate != null;
        }
    },
    businessName: { type: String, required: true },
    serviceName: { type: String, required: true },
    business: { type: Types.ObjectId, required: true, ref: "Business" },
    service: { type: [Types.ObjectId], required: true, ref: "Service" , default : [] },
    couponCodes: [{
        type: {
            value: { type: String },
            used: { type: Boolean },
            user: { type: Types.ObjectId, ref: "User" },
        }
    }],
    isActive: { type: Boolean, default: false },
    creator: { type: Types.ObjectId, ref: "User" }
})