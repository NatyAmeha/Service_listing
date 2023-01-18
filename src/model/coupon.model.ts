import { HydratedDocument, Schema, Types } from "mongoose"
import { CouponType } from "src/utils/constants"
import { Business } from "./business.model"
import { Service } from "./service.model"
import { User } from "./user.model"

export class Coupon {
    _id? : String
    name?: String
    description?: String
    images?: String[]
    couponType: String
    startDate?: Date
    endDate?: Date
    businessName?: String
    serviceName?: String
    business?: String
    service?: String
    couponCodes?: CouponCode[]
    isActive?: Boolean
    dateCreated?: Date
    creator? : String

    static ModelName = "Coupon"

}

export class CouponCode {
    value?: String
    used?: Boolean
    user?: String
}

export type CouponDocument = HydratedDocument<Coupon>;

export var couponSchema = new Schema<Coupon>({
    name: { type: String, required: true },
    description: { type: String },
    images: { type: [String], required: true },
    couponType: { type: String, required: true, enum: CouponType },
    startDate: { type: Date },
    endDate: {
        type: Date, required: (): boolean => {
            const item = this as Coupon
            return item.endDate != null;
        }
    },
    businessName: { type: String, required: true },
    serviceName: { type: String, required: true },
    business: { type: Types.ObjectId, required: true, ref: "Business" },
    service: { type: Types.ObjectId, required: true, ref: "Service" },
    couponCodes: [{
        type: {
            value: { type: String },
            used: { type: Boolean },
            user: { type: Types.ObjectId, ref: "User" },
        }
    }],
    isActive: { type: Boolean, default: false },
    creator : {type : Types.ObjectId , ref : "User"}
})