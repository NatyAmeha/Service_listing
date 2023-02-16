import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { BusinessDTO } from "src/dto/business.dto"
import { ReviewDTO } from "src/dto/review.dto"
import { Business, BussinessDocument } from "src/model/business.model"
import { MongodbRepo } from "./mongodb.repo"
import { IRepository } from "./repo.interface"
import * as _ from "lodash"
import { Review } from "src/model/review.model"
import { Inject } from "@nestjs/common/decorators"
import { Helper, IHelper } from "src/utils/helper"

export interface IBusinessRepo extends IRepository<Business> {
    getRelatedBusiness(businessInfo: Business): Promise<BusinessDTO[]>;
    getTopBusinessesByReview(): Promise<BusinessDTO[]>
}

@Injectable()
export class BusinessRepository extends MongodbRepo<BussinessDocument> implements IBusinessRepo {
    static injectName = "BUSINESS_REPOSITORY"
    constructor(@InjectModel(Business.ModelName) protected businessModel: Model<BussinessDocument>,
        @Inject(Helper.INJECT_NAME) private helper: IHelper) {
        super(businessModel)

    }

    async getRelatedBusiness(businessInfo: Business): Promise<BusinessDTO[]> {
        var relatedBusinesses = await this.find({ category: businessInfo.category }, ["reviews"], 10) as Business[]

        var result = relatedBusinesses.filter(business => business._id.toString() != businessInfo._id.toString()).map(businessInfo => {
            const { reviews, ...rest } = businessInfo
            var ratingInfo = this.helper.calculateRating(reviews as Review[])
            return new BusinessDTO({ businessInfo: rest, reviewInfo: new ReviewDTO({ rating: ratingInfo.rating ?? 0, count: reviews.length }) })
        })
        return result
    }

    async getTopBusinessesByReview(): Promise<BusinessDTO[]> {
        var businesses = await this.find({}, ["reviews"], 1000) as Business[]
        var starterDate = new Date(Date.now())
        var currentDate = new Date(Date.now())
        starterDate.setDate(starterDate.getDate() - 30)

        var businessesInfo = await businesses.map(business => {
            const { reviews, ...rest } = business
            //get reviews given by the last 30 days

            var thisMonthReview = _.filter(business.reviews as Review[], review => ((review.dateCreated > starterDate) && (review.dateCreated < currentDate)))
            var rating = 0
            if (thisMonthReview.length > 0) {
                rating = this.helper.calculateRating(thisMonthReview).rating
            }
            return new BusinessDTO({ businessInfo: rest, reviewInfo: new ReviewDTO({ rating: rating, count: thisMonthReview.length }) })
        })
        var sortedBusinesses = _.orderBy(businessesInfo, business => business.reviewInfo.rating, "desc")

        return _.take(sortedBusinesses, 10)

    }

}