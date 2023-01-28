import { Inject, Injectable } from '@nestjs/common';
import { ClientSession } from 'mongoose';
import { ReviewDTO } from 'src/dto/review.dto';
import { KeyReview, Review } from 'src/model/review.model';
import { BusinessRepository, IBusinessRepo } from 'src/repo/business.repo';
import { IReviewRepo, ReviewRepository } from 'src/repo/review.repo';
import { ServiceRepository } from 'src/repo/service.repo';
import * as _ from 'lodash'
import { Helper, IHelper } from 'src/utils/helper';

@Injectable()
export class ReviewService {
    constructor(@Inject(ReviewRepository.injectName) private reviewRepo: IReviewRepo,
        @Inject(Helper.INJECT_NAME) private helper: IHelper) {

    }

    async createReview(reviewInfo: Review, session?: ClientSession): Promise<Review> {
        if (session) {
            this.reviewRepo.addSession(session)
        }
        var reviewCreateResult = await this.reviewRepo.add(reviewInfo)
        return reviewCreateResult
    }

    async updateReview(reviewId: String, newReviewInfo: Review): Promise<Boolean> {
        var result = await this.reviewRepo.update({ _id: reviewId }, newReviewInfo)
        return result
    }

    async getHighlevelReviewInfo(predicate: any, keyPoints?: String[], page: number = 1, limit: number = 1000): Promise<ReviewDTO> {
        var rating = 0.0
        var keyReviewPOint: String[] = []
        var ratingByKey: KeyReview[] = []
        var serviceReviews = await this.reviewRepo.findandSort(predicate, { dateCreated: -1 }, limit, page)
        serviceReviews.forEach(review => {
            keyReviewPOint.push(...review.keyPoints.map(kp => kp.key))
        })
        if (keyReviewPOint.length > 0) {

            ratingByKey =  keyReviewPOint.map(key => {
                var keyRating = this.helper.calculateRating(serviceReviews, [key])
                return new KeyReview({ key: key, rating: keyRating })
            })
        }
        if (serviceReviews.length > 0) {
            rating = this.helper.calculateRating(serviceReviews, keyPoints)
        }

        var reviewDTOResult = new ReviewDTO({ rating: rating ?? 0.0, reviews: _.take(serviceReviews, 10), keyPoint : ratingByKey, count: serviceReviews.length })
        return reviewDTOResult
    }

    // async getBusinessReviewDetails(businessId: String, keyPoints?: String[]): Promise<ReviewDTO> {
    //     var businessReview = await this.reviewRepo.findandSort({ business: businessId } , {dateCreated : -1})
    //     var rating = this.helper.calculateRating(businessReview, keyPoints)
    //     var reviewDTOResult = new ReviewDTO({ rating: rating, reviews: _.take(businessReview, 10) })
    //     return reviewDTOResult
    // }



}
