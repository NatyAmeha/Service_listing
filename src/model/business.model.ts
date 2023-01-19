import { HydratedDocument, Schema, Types } from "mongoose"
import { Address } from "./address.model"
import { Contact } from "./contact.model"
import { Service } from "./service.model"
import { User } from "./user.model"

export class Business {
    _id? : String
    name?: String
    description?: String
    category?: String
    likeCount?: number
    verified?: Boolean
    services?: String[] | Service[]
    images?: String[]
    addresses?: Address[]
    contact?: Contact
    dateCreated? : Date
    creator? : String

    static ModelName = "Business"
}

export var businessSchema: Schema = new Schema<Business>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    likeCount: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    services: { type: [Types.ObjectId], ref: "Service" , default : []},
    images: { type: [String], required: true },
    dateCreated : {type : Date , default : Date.now()},
    creator : {type : Types.ObjectId , ref : "User"},
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

export type BussinessDocument = HydratedDocument<Business>