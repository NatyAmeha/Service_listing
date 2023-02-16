import { KeyReview, Review } from "src/model/review.model"

export class ReviewDTO{
    rating? : number
    count? : number
    reviews? : Review[]
    businessName? : String
    keyPoint? : KeyReview[]
    fiveStar?: number
    fourStar? : number
    threeStar? : number
    twoStar? : number
    oneStar? : number

    constructor(data : Partial<ReviewDTO>){
        Object.assign(this, data);
    }
}   