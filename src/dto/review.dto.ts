import { KeyReview, Review } from "src/model/review.model"

export class ReviewDTO{
    rating? : number
    count? : number
    reviews? : Review[]
    keyPoint? : KeyReview[]

    constructor(data : Partial<ReviewDTO>){
        Object.assign(this, data);
    }
}   