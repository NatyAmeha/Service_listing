import { Inject, Injectable } from '@nestjs/common';
import { result } from 'lodash';
import { ClientSession } from 'mongoose';
import { BusinessCreateDTO, BusinessDTO } from 'src/dto/business.dto';
import { ReviewDTO } from 'src/dto/review.dto';
import { ServiceDTO } from 'src/dto/service.dto';
import { Business } from 'src/model/business.model';
import { BusinessRepository, IBusinessRepo } from 'src/repo/business.repo';
import { IReviewRepo, ReviewRepository } from 'src/repo/review.repo';
import { IUserRepo, UserRepository } from 'src/repo/user.repo';
import { Helper, IHelper } from 'src/utils/helper';
import * as _ from "lodash"
import { ReviewService } from 'src/review/review.service';
import { User } from 'src/model/user.model';
import { IServiceItemRepo, ServiceItemRepository } from 'src/repo/service_item.repo';
import { ProductDTO } from 'src/dto/service_item.dto';
import { Service } from 'src/model/service.model';
import { Coupon } from 'src/model/coupon.model';
import { CouponDTO } from 'src/dto/coupon.dto';
import { ISubscriptionRepo, SubscriptionRepository } from 'src/repo/subscription.repo';
import { SubscriptionLevel } from 'src/utils/constants';

@Injectable()
export class BusinessService {
    constructor(@Inject(BusinessRepository.injectName) private businessRepo: IBusinessRepo,
        @Inject(UserRepository.injectName) private userRepo: IUserRepo,
        @Inject(ServiceItemRepository.injectName) private serviceItemRepo: IServiceItemRepo,

        @Inject(Helper.INJECT_NAME) private helper: IHelper,
        private reviewService: ReviewService) {

    }

    async createBusiness(businessCreateInfo: BusinessCreateDTO, userId: String, session?: ClientSession): Promise<Business> {
        if (session) {
            this.businessRepo.addSession(session)
            this.userRepo.addSession(session)

        }

        if (businessCreateInfo.subscriptionLevel == SubscriptionLevel.PREMIUM)
            businessCreateInfo.business.verified = true
        else businessCreateInfo.business.verified = false;  
        //save business info
        const {_id , ...restBusinessInfo} = businessCreateInfo.business
        var businessResult = await this.businessRepo.add(restBusinessInfo)

        // update user info
        var userUpdateREsult = await this.userRepo.updateWithFilter({ _id: userId }, { $push: { userBusinesses: businessResult._id } })
        return businessResult

    }

    async getBusinesses(query?: String, pageIndex: number = 1, pageSize: number = 20): Promise<Business[]> {
        var businessResult: Business[] = []
        if (query) {
            businessResult = await this.businessRepo.find({ name: query }, pageIndex, pageSize)
        }
        else {
            businessResult = await this.businessRepo.getAll(pageIndex, pageSize)
        }
        return businessResult;
    }

    async editBusiness(businessId: String, newInfo: Business): Promise<Boolean> {
        // update business info
        var updateResult = await this.businessRepo.update({ _id: businessId }, newInfo)
        return updateResult
    }

    async updateBusinessClaimStatus(businessId: String, claimStatus : Boolean): Promise<Boolean> {
        // update business info
        var updateResult = await this.businessRepo.updateWithFilter({ _id: businessId }, {cliamed : claimStatus})
        return updateResult
    }



    async updateBusinessVerificationStatus(businessId: String, status : boolean): Promise<Boolean> {
        // update business info
        var updateResult = await this.businessRepo.updateWithFilter({ _id: businessId },{verified : status})
        return updateResult
    }

    async getBusinessWithLimitedInfo(businessId : String , selectedFields : String) : Promise<Business>{
        var businessInfo = await this.businessRepo.get(businessId, ["services", "coupons", "services.coupons"] , selectedFields)
        return businessInfo
    }

    async getBusinessDetails(businessId: String, user?: User): Promise<BusinessDTO> {
        //get businessInfo
        var businessInfo = await this.businessRepo.get(businessId, ["services", "coupons", "services.coupons"])
        const { services, coupons, ...rest } = businessInfo;

        var couponsDTO = this.helper.filterActiveCoupons(coupons as Coupon[])

        var servicesDTOs = services.map(service => new ServiceDTO({ service: service }))
        var relatedBusinesses = await this.businessRepo.getRelatedBusiness(businessInfo)


        var businessDTOResult = new BusinessDTO({
            businessInfo: rest,
            relatedBusinesses: relatedBusinesses, services: servicesDTOs, coupons: couponsDTO
        })

        // get review info
        var businessReview = await this.reviewService.getHighlevelReviewInfo({ business: businessId }, null, 1, 5, true)

        // await this.reviewRepo.findandSort({ business: businessId } , {dateCreated : -1})
        // var rating = this.helper.calculateRating(businessReview)
        // var reviewDTOResult = new ReviewDTO({ rating: rating, reviews: _.take(businessReview, 10) })
        businessDTOResult.reviewInfo = new ReviewDTO({ ...businessReview, reviews: [] })

        //get trending products
        var products = await this.serviceItemRepo.findandSort({ business: businessId }, { viewCount: -1 }, 10, 1)
        var productDTOs = products.map(product => new ProductDTO({ serviceItem: product , priceRange : Helper.calculateProductPrice(product) }))
        businessDTOResult.trendingProducts = productDTOs

        // check business is in user's favorite
        if (user) {
            businessDTOResult.favorite = user.favoriteBusinesses.findIndex(id => id.toString() == businessId.toString()) > -1

        }
        return businessDTOResult;
    }

    async getBusinessReviewDetails(businessId: String, keyPoints?: String[], page: number = 1, size: number = 100, star: number = -1): Promise<ReviewDTO> {
        var businessReview = await this.reviewService.getHighlevelReviewInfo({ business: businessId }, keyPoints, page, size, true, star)
        return businessReview
    }

    async addToFavorite(businessId: String, userId: String, session: ClientSession): Promise<Boolean> {
        this.userRepo.addSession(session)
        this.businessRepo.addSession(session)
        var result = await this.businessRepo.updateWithFilter({ _id: businessId }, { $inc: { likeCount: 1 } })
        var userUpdateResult = await this.userRepo.updateWithFilter({ _id: userId }, { $addToSet: { favoriteBusinesses: businessId } })
        return userUpdateResult
    }

    async removeFromFavorite(businessId: String, userId: String, session: ClientSession): Promise<Boolean> {
        this.userRepo.addSession(session)
        this.businessRepo.addSession(session)
        var result = await this.businessRepo.updateWithFilter({ _id: businessId }, { $inc: { likeCount: -1 } })
        var userUpdateResult = await this.userRepo.updateWithFilter({ _id: userId }, { $pull: { favoriteBusinesses: businessId } })
        return userUpdateResult
    }


}
