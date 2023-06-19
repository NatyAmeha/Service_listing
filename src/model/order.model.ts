import { number } from "joi"
import mongoose, { HydratedDocument, Schema, Types } from "mongoose"
import { OrderStatus, OrderType } from "src/utils/constants"
import { Address } from "./address.model"
import { Business } from "./business.model"
import { Contact } from "./contact.model"
import { Service } from "./service.model"
import { ServiceItem } from "./service_item.model"
import { User } from "./user.model"

export class Order {
    _id?: String
    name?: String
    image?: String[]
    price?: number
    priceRange?: { min: number, max: number }
    business?: String | Business
    items?: OrderItem[]
    code?: String
    user: String
    status: String
    expireDate?: Date
    moreInfo?: Map<String, String>
    type?: String
    dateCreated?: Date
    address?: Address
    contact?: Contact
    discount?: number

    static ModelName = "Order"

}

export class OrderItem {
    _id?: String
    name? : String
    serviceItem?: String | ServiceItem
    productInfo: ServiceItem
    qty?: number
    price?: number
    coupon?: String
    selectedDates?: Date[]
    business?: String | Business
    service?: String | Service
    image?: String
    deliveryStatus?: String

    constructor(data: Partial<OrderItem>) {
        Object.assign(this, data);
    }
}

export var orderSchema: Schema = new mongoose.Schema<Order>({
    
    name: { type: String, required: true },
    image: { type: [String], required: true },
    price: { type: Number },
    priceRange: {
        type: {
            min: { type: Number },
            max: { type: Number }
        },
    },
    business: { type: Types.ObjectId, ref: "Business" },
    items: [{
        type: {
           
            name : {type : String , trim : true},
            serviceItem: { type: Types.ObjectId, ref: "ServiceItem" },
            qty: { type: Number },
            price: { type: Number },
            coupon: { type: Types.ObjectId },
            selectedDates: { type: [Date] },
            business: { type: Types.ObjectId, ref: "Business", required: true },
            service: { type: Types.ObjectId, ref: "Service", required: true },
            image: { type: String, required: true },
            deliveryStatus: { type: String, default: OrderStatus.PENDING.toString() },
        },
        default: []
    }],
    code: { type: String },
    user: { type: Types.ObjectId, required: true, ref: "User" },
    status: { type: String, enum: OrderStatus, default: OrderStatus.PENDING },
    expireDate: { type: Date },
    moreInfo: { type: Map, of: String },
    type: { type: String, enum: OrderType, required: true },
    dateCreated: { type: Date, default: Date.now() },
    discount: { type: Number },

    address: {
        type: {
            location: {
                type: { type: String, enum: ["Point"], required: false },
                coordinates: { type: [Number], required: false }
            },
            mapLink: { type: String },
            localAddress: { type: String }
        },
    },
    contact: {
        type: {
            email: { type: String },
            phoneNumber: { type: [String] },
            links: { type: Map, of: String }
        }
    },
})

export type OrderDocuent = HydratedDocument<Order>;