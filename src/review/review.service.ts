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
        console.log("review update result" , result)
        return result
    }

    async getHighlevelReviewInfo(predicate: any, keyPoints?: String[],
        page: number = 1, limit: number = 1000, divideByStarNumber: boolean = false, star: number = -1): Promise<ReviewDTO> {
        var rating = 0.0
        var keyReviewPOint: String[] = []
        var ratingByKey: KeyReview[] = []
        var reviews = await this.reviewRepo.findandSort(predicate, { dateCreated: -1 })
        reviews.forEach(review => {
            keyReviewPOint.push(...review.keyPoints.map(kp => kp.key))
        })



        if (keyReviewPOint.length > 0) {
            console.log("key points inside", keyPoints)
            var uniqKeyPoints = Array.from(new Set(keyReviewPOint))
            ratingByKey = uniqKeyPoints.map(key => {
                var keyRating = this.helper.calculateRating(reviews, [key])
                return new KeyReview({ key: key, rating: keyRating.rating, count: keyRating.count })
            })
        }
        
        if (reviews.length > 0) {
            rating = this.helper.calculateRating(reviews, keyPoints).rating
        }

        if (divideByStarNumber) {
            var fiveStar = this.helper.getReviewsByStarAmount(reviews, 5).length ?? 0
            var fourStar = this.helper.getReviewsByStarAmount(reviews, 4).length ?? 0
            var threeStar = this.helper.getReviewsByStarAmount(reviews, 3).length ?? 0
            var twoStar = this.helper.getReviewsByStarAmount(reviews, 2).length ?? 0
            var oneStar = this.helper.getReviewsByStarAmount(reviews, 1).length ?? 0
        }
        var selectedReviewList = reviews

        if(star > -1 && star <=5){
            var selectedReviewsByStarNumber = this.helper.getReviewsByStarAmount(reviews , star)
            selectedReviewList= selectedReviewsByStarNumber
        }

        
        var reviewDTOResult = new ReviewDTO({
            rating: rating,
            fiveStar: fiveStar, fourStar: fourStar, threeStar: threeStar, twoStar: twoStar, oneStar: oneStar,

            reviews: _.take(selectedReviewList, limit), keyPoint: ratingByKey, count: reviews.length
        })
        return reviewDTOResult
    }

    // async getBusinessReviewDetails(businessId: String, keyPoints?: String[]): Promise<ReviewDTO> {
    //     var businessReview = await this.reviewRepo.findandSort({ business: businessId } , {dateCreated : -1})
    //     var rating = this.helper.calculateRating(businessReview, keyPoints)
    //     var reviewDTOResult = new ReviewDTO({ rating: rating, reviews: _.take(businessReview, 10) })
    //     return reviewDTOResult
    // }



}
