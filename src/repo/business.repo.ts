import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { BusinessDTO } from "src/dto/business.dto"
import { ReviewDTO } from "src/dto/review.dto"
import { Business, BussinessDocument } from "src/model/business.model"
import { MongodbRepo } from "./mongodb.repo"
import { IRepository } from "./repo.interface"

export interface IBusinessRepo extends IRepository<Business> {
    getRelatedBusiness(businessInfo: Business): Promise<BusinessDTO[]>;
}

@Injectable()
export class BusinessRepository extends MongodbRepo<BussinessDocument> implements IBusinessRepo {
    static injectName = "BUSINESS_REPOSITORY"
    constructor(@InjectModel(Business.ModelName) protected businessModel: Model<BussinessDocument>) {
        super(businessModel)

    }
    async getRelatedBusiness(businessInfo: Business): Promise<BusinessDTO[]> {
        var relatedBusinesses = await this.find({ category: businessInfo.category }, ["reviews"], 10) as Business[]

        var result = relatedBusinesses.map(businessInfo => {
            const { reviews, ...rest } = businessInfo
            return new BusinessDTO({ businessInfo: rest, reviewInfo: new ReviewDTO({ rating: 3.5, count: reviews.length  }) })
        })
        return result
    }

}