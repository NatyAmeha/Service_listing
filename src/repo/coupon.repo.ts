import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { CouponDTO } from "src/dto/coupon.dto"
import { Business } from "src/model/business.model"

import { Coupon, CouponDocument } from "src/model/coupon.model"
import { Service } from "src/model/service.model"
import { MongodbRepo } from "./mongodb.repo"
import { IRepository } from "./repo.interface"

export interface ICouponRepo extends IRepository<Coupon> {
    getActiveCoupons(endData: Date, page: number, pageSize: number): Promise<Coupon[]>
    getCouponsForService(serviceId: String): Promise<CouponDTO[]>
    getCouponsForBusiness(businessId: String): Promise<CouponDTO[]>
}


@Injectable()
export class CouponRepository extends MongodbRepo<CouponDocument> implements ICouponRepo {
    static injectName = "COUPON_REPOSITORY"
    constructor(@InjectModel(Coupon.ModelName) protected couponModel: Model<CouponDocument>) {
        super(couponModel)
    }
    async getActiveCoupons(endDate: Date, page: number, pageSize: number): Promise<Coupon[]> {
        var result = await this.couponModel.find(
            {
                endDate: { $gte: new Date(endDate) },
                "couponCodes": { $elemMatch: { used: false } }
            },
        ).populate(['service', 'business'])
        return result as Coupon[];
    }
    async getCouponsForService(serviceId: String, endDate?: Date): Promise<CouponDTO[]> {
        var result = await this.couponModel.find({
            service: serviceId,
            endDate: { $gte: new Date(endDate) },
            "couponCodes": {
                $elemMatch: { used: false }
            }
        }).populate(['service', 'business']) as Coupon[]

        var couponDtoResult = result.map(coupon => {
            const { service, business, ...remaining } = coupon
            coupon.service = (service as Service)._id
            coupon.business = (business as Business)._id
            return new CouponDTO({
                couponInfo: coupon,
                services: [service as Service],
                business: business as Business
            })
        })
        return couponDtoResult;
    }
    async getCouponsForBusiness(businessId: String, endDate: Date = new Date(Date.now())): Promise<CouponDTO[]> {

        var result = await this.couponModel.find({
            business: businessId,
            endDate: { $gte: new Date(endDate) },
            "couponCodes": {
                $elemMatch: { used: false },
            }
        }).populate(['service', 'business']) as Coupon[]
        var couponDtoResult = result.map(coupon => {
            const { service, business, ...remaining } = coupon
            coupon.service = (service as Service)._id
            coupon.business = (business as Business)._id
            return new CouponDTO({
                couponInfo: coupon,
                services: [service as Service],
                business: business as Business
            })
        })
        return couponDtoResult;
    }
}