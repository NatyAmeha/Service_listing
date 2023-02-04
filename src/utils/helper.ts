import { Injectable, InternalServerErrorException } from "@nestjs/common";
import mongoose, { ClientSession, Connection, startSession } from "mongoose";
import { Coupon, CouponCode } from "src/model/coupon.model";
import { Review } from "src/model/review.model";
import * as _ from "lodash"
import { CouponDTO } from "src/dto/coupon.dto";
export interface IHelper {

    generateCouponCodes(amount: number);
    generateCode(length: number, generatedCodes: String[], dictionary?: String)
    calculateRating(reviews: Review[], keyPoints?: String[]): { rating: number, count: number }
    filterActiveCoupons(couponsInfo: Coupon[]): CouponDTO[]
}

@Injectable()
export class Helper implements IHelper {

    static INJECT_NAME = "HELPER_INJECT"
    generateCouponCodes(amount: number): CouponCode[] {
        var codesResult: String[] = []
        for (let index = 0; index < amount; index++) {
            var generatedCode = this.generateCode(6, codesResult)
            if (generatedCode) codesResult.push(generatedCode)
        }
        return codesResult.map(code => new CouponCode({ value: code, used: false }))
    }
    static async runInTransaction<R>(connection: Connection, operation: (sesstion: ClientSession) => Promise<R>) {
        var session = await connection.startSession();
        try {
            // var transactionResult = await session.withTransaction<R>(async (sess) => {
            //     var result = await operation(sess)
            //     return await result;
            // })
            // return transactionResult

            session.startTransaction();
            var result = await operation(session)
            await session.commitTransaction()

            return result;

        } catch (ex) {
            console.log("transaction error", ex.message)
            // await session.abortTransaction()
            await session.endSession()
            throw new InternalServerErrorException("", "Transaction error occurred")
        }
    }

    generateCode(length: number, generatedCodes: String[], dictionary?: String): String | undefined {
        var text = "";
        var possible = dictionary ?? "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        if (generatedCodes.indexOf(text) == -1) {
            return text;
        }
        else {
            this.generateCode(length, generatedCodes);
        }
    }

    calculateRating(reviews: Review[], keyPoints?: String[]): { rating: number, count: number } {
        var overallRating = 0.0;
        var reviewCount = 0;
        if (keyPoints) {
            reviews.forEach(review => {
                var selectedKeyPoints = _.filter(review.keyPoints, kp => _.includes(keyPoints, kp.key))
                if (selectedKeyPoints) {
                    var keypointRating = _.divide(_.sumBy(_.map(selectedKeyPoints, kP => kP.rating), r => r), selectedKeyPoints?.length) ?? 0
                    if (!Number.isNaN(keypointRating)){
                        overallRating += keypointRating ?? 0
                        reviewCount++

                    }
                }
            })
        }
        else {
            reviews.forEach(review => {
                var keypointRating = _.divide(_.sumBy(_.map(review.keyPoints, kP => kP.rating), r => r), review?.keyPoints?.length) ?? 0
                if (!Number.isNaN(keypointRating)){

                    overallRating += keypointRating ?? 0
                    reviewCount++
                }
            })
        }
        var finalRating = _.divide(overallRating, reviewCount)
        
        return {
            rating: finalRating ?? 0,
            count: reviewCount
        };

    }

    filterActiveCoupons(coupons: Coupon[]): CouponDTO[] {
        var couponsDTOResult = coupons
            .filter(coupon => (coupon.totalUsed < coupon.maxAmount) || (coupon.endDate > new Date(Date.now())))
            .map(cp => {
                const { service, business, ...rest } = cp
                return new CouponDTO({ couponInfo: rest })
            })
        return couponsDTOResult
    }
}