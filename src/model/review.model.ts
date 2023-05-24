import { HydratedDocument, Schema, Types } from "mongoose"
import { User } from "./user.model"

export class Review {
    _id? : String
    description?: String
    serviceName?: String
    businessName?: String
    service?: String
    business?: String
    keyPoints?: KeyReview[]
    dateCreated? : Date
    username? : String
    profileImage? : String
    user? : String | User 

    static ModelName = "Review"
}

export class KeyReview {
    key?: String
    rating?: number
    count? : number
    constructor(data : Partial<KeyReview>){
        Object.assign(this, data);
    }

}

export type ReviewDocument = HydratedDocument<Review>

export var reviewSchema = new Schema<Review>({
    description: { type: String , trim : true },
    serviceName: { type: String, required: true , trim : true },
    businessName: { type: String, required: true , trim : true },
    service: { type: Types.ObjectId, required: true , ref : "Service" },
    business: { type: Types.ObjectId, required: true , ref : "Business"},
    keyPoints: [{
        type: {
            key: { type: String, required: true },
            rating: { type: Number, required: true }
        },
    }],
    username : {type : String , required : true , trim : true},
    profileImage : {type : String },
    user : {type : Types.ObjectId , ref : "User" , required : true},
    dateCreated : {type : Date , default : Date.now()}
})