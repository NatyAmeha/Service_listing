import { HydratedDocument, Schema } from "mongoose"

export class Review {
    description?: String
    serviceName?: String
    businessName?: String
    service?: String
    business?: String
    keyPoints: KeyReview[]

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
    service: { type: String, required: true },
    business: { type: String, required: true },
    keyPoints: [{
        type: {
            key: { type: String, required: true },
            rating: { type: String, required: true }
        },
    }]
})