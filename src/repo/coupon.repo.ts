import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { CouponDTO } from "src/dto/coupon.dto"
import { ServiceDTO } from "src/dto/service.dto"
import { Business } from "src/model/business.model"

import { Coupon, CouponDocument } from "src/model/coupon.model"
import { Service } from "src/model/service.model"
import { ServiceItem } from "src/model/service_item.model"
import { MongodbRepo } from "./mongodb.repo"
import { IRepository } from "./repo.interface"

export interface ICouponRepo extends IRepository<Coupon> {
    getActiveCoupons(endData: Date, page: number, pageSize: number, id?: String[]): Promise<CouponDTO[]>
    getCouponsForService(serviceId: String): Promise<CouponDTO[]>
    getCouponsForBusiness(businessId: String): Promise<CouponDTO[]>
}


@Injectable()
export class CouponRepository extends MongodbRepo<CouponDocument> implements ICouponRepo {
    static injectName = "COUPON_REPOSITORY"
    constructor(@InjectModel(Coupon.ModelName) protected couponModel: Model<CouponDocument>) {
        super(couponModel)
    }
    async getActiveCoupons(endDate: Date, page: number, pageSize: number, id?: String[]): Promise<CouponDTO[]> {
        if (id) {
            var result = await this.couponModel.find(
                {
                    _id: { $in: id },
                    endDate: { $gte: new Date(endDate) },
                    "couponCodes": { $elemMatch: { used: false } }
                },
            ).populate([
                "business",
                {
                    path: "service", populate: { path: "serviceItems", model: "ServiceItem" },
                },
            ]).lean()
        }
        else {
            var result = await this.couponModel.find(
                {
                    endDate: { $gte: new Date(endDate) },
                    "couponCodes": { $elemMatch: { used: false } }
                },
            ).populate([
                "business",
                {
                    path: "service", populate: { path: "serviceItems", model: "ServiceItem" },
                },
            ]).lean()
        }


        var result = await this.couponModel.find(
            {
                endDate: { $gte: new Date(endDate) },
                "couponCodes": { $elemMatch: { used: false } }
            },
        ).populate([
            "business",
            {
                path: "service", populate: { path: "serviceItems", model: "ServiceItem" },
            },
        ]).lean()

        var couponResult = await result.map(coupon => {
            const { service, business, ...rest } = coupon
            var serviceDTOResult = (service as Service[]).map(ser => {
                const  {serviceItems, ...rest} = ser
                return new ServiceDTO({
                    service: rest, serviceItems: serviceItems as ServiceItem[]
                })
            })
            return new CouponDTO({
                couponInfo: rest,
                services: serviceDTOResult,
                business: business as Business
            })
        })
        return couponResult
    }
    async getCouponsForService(serviceId: String, endDate?: Date): Promise<CouponDTO[]> {
        var result = await this.couponModel.find({
            service: serviceId,
            endDate: { $gte: new Date(endDate) },
            "couponCodes": {
                $elemMatch: { used: false }
            }
        }).populate([
            "business",
            {
                path: "service", populate: { path: "serviceItems", model: "ServiceItem" },
            },
        ]).lean() as Coupon[]
        var couponDtoResult = result.map(coupon => {
            const { service, business, ...remaining } = coupon
            var serviceDTOResult = (service as Service[]).map(ser => {
                const  {serviceItems, ...rest} = ser
                return new ServiceDTO({
                    service: rest, serviceItems: serviceItems as ServiceItem[]
                })  
            })

            return new CouponDTO({
                couponInfo: remaining,
                services: serviceDTOResult,
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
        }).populate([
            "business",
            {
                path: "service", populate: { path: "serviceItems", model: "ServiceItem" },
            },
        ]).lean()
        var couponDtoResult = result.map(coupon => {
            const { service, business, ...rest } = coupon
            var serviceDTOResult = (service as Service[]).map(ser => {
                const  {serviceItems, ...rest} = ser
                return new ServiceDTO({
                    service: rest, serviceItems: serviceItems as ServiceItem[]
                })
            })
            return new CouponDTO({
                couponInfo: rest,
                services: serviceDTOResult,
                business: business as Business
            })
        })
        return couponDtoResult;
    }
}