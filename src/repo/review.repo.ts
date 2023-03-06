import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose/dist";
import { Model } from "mongoose";
import { Review, ReviewDocument } from "src/model/review.model";
import { MongodbRepo } from "./mongodb.repo";
import { IRepository } from "./repo.interface";

export interface IReviewRepo extends IRepository<Review> {
    isUserGaveReviewForService(serviceId: String, userId: String): Promise<boolean>
 }

@Injectable()
export class ReviewRepository extends MongodbRepo<ReviewDocument> implements IReviewRepo {
    static injectName = "REVIEW_REPOSITORY"
    constructor(@InjectModel(Review.ModelName) protected reviewModel: Model<ReviewDocument>) {
        super(reviewModel)
    }

    async isUserGaveReviewForService(serviceId: String, userId: String): Promise<boolean> {
        var result = await this.findOne({ service: serviceId, user: userId })
        if (result._id)
            return true;
        else return false;
    }
}