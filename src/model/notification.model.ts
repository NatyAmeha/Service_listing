
import { required } from "joi";
import { HydratedDocument, Schema, Types } from "mongoose";
import { type } from "os";
import { Business } from "./business.model";
import { Order } from "./order.model";
import { Service } from "./service.model";
import { User } from "./user.model";

export class Notification {
    _id?: String
    title?: String
    description?: String
    order?: String | Order
    dateCreated?: Date
    seen?: Boolean
    recepient?: String | User
    business?: String | Business
    businessName?: String
    notificationType?: String
    service?: String | Service
    serviceName?: String

    static ModelName = "Notification"

    constructor(data: Partial<Notification>) {
        Object.assign(this, data);
    }
}

export type NotificationDocument = HydratedDocument<Notification>;

export var notificationSchema = new Schema<Notification>({
    title: { type: String, required: true },
    description: { type: String },
    recepient: { type: Types.ObjectId, ref: "User" },
    notificationType: { type: String, required: true },
	order: { type: Types.ObjectId, ref: "Order" },
    dateCreated: { type: Date, default: Date.now() },
    seen: { type: Boolean, default: false },
    business: { type: Types.ObjectId, ref: "Business" },
    service: { type: Types.ObjectId, ref: "Service" },
    businessName: { type: String },
    serviceName: { type: String }
})

