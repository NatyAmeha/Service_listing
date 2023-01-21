import { HydratedDocument, Schema, Types } from "mongoose"

export class Review {
    _id? : String
    description?: String
    serviceName?: String
    businessName?: String
    service?: String
    business?: String
    keyPoints?: KeyReview[]
    dateCreated? : Date 

    static ModelName = "Review"
}

export class KeyReview {
    key?: String
    rating?: number

}

export type ReviewDocument = HydratedDocument<Review>

export var reviewSchema = new Schema<Review>({
    description: { type: String },
    serviceName: { type: String, required: true },
    businessName: { type: String, required: true },
    service: { type: Types.ObjectId, required: true , ref : "Service" },
    business: { type: Types.ObjectId, required: true , ref : "Business"},
    keyPoints: [{
        type: {
            key: { type: String, required: true },
            rating: { type: Number, required: true }
        },
    }],
    dateCreated : {type : Date , default : Date.now()}
})