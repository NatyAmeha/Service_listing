import { number } from "joi"
import mongoose, { HydratedDocument, Schema, Types } from "mongoose"
import { OrderStatus, OrderType } from "src/utils/constants"
import { Address } from "./address.model"
import { User } from "./user.model"

export class Order {
    _id? : String
    name?: String
    image?: String
    price?: number
    priceRange?: { min: number, max: number }
    business?: String
    items?: OrderItem[]
    code?: String
    user: String
    status: String
    expireDate?: Date
    moreInfo?: Map<String, String>
    type?: String
    dateCreated?: Date
    address?: Address

}

export class OrderItem {
    serviceItem?: String
    qty?: number
    coupon?: String
}

var orderSchema: Schema = new mongoose.Schema<Order>({
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, },
    priceRange: { type: {} },
    business: { type: String },
    items: [{
        type: {
            serviceItem: { type: String },
            qty: { type: Number },
            coupon: { type: Types.ObjectId }
        },
        default: []
    }],
    code: { type: String },
    user: { type: Types.ObjectId, required: true },
    status: { type: String, enum: OrderStatus, default: OrderStatus.PENDING.toString() },
    expireDate: { type: Date },
    moreInfo: { type: Map, of: String },
    type: { type: String, enum: OrderType, required: true },
    dateCreated: { type: Date, default: Date.now() },
    address: {
        type: {
            location: {
                type: { type: String, enum: ["Point"], required: false },
                coordinates: { type: [Number], required: false }
            },
           
            localAddress: { type: String }
        }, required: true
    },
})

export type OrderDocuent = HydratedDocument<Order>;