import { Inject, Injectable } from "@nestjs/common";
import { ClientSession } from "mongoose";
import { CouponDTO } from "src/dto/coupon.dto";
import { ServiceDTO } from "src/dto/service.dto";
import { ProductDTO } from "src/dto/service_item.dto";
import { Business } from "src/model/business.model";
import { Coupon, CouponCode } from "src/model/coupon.model";
import { Service } from "src/model/service.model";
import { ServiceItem } from "src/model/service_item.model";
import { BusinessRepository, IBusinessRepo } from "src/repo/business.repo";
import { CouponRepository, ICouponRepo } from "src/repo/coupon.repo";
import { OrderRepository } from "src/repo/order.repo";
import { IServiceRepo, ServiceRepository } from "src/repo/service.repo";
import { Helper, IHelper } from "src/utils/helper";

@Injectable()
export class CouponService {
    constructor(
        @Inject(CouponRepository.injectName) private couponRepo: ICouponRepo,
        @Inject(ServiceRepository.injectName) private serviceRepo: IServiceRepo,
        @Inject(BusinessRepository.injectName) private businessRepo: IBusinessRepo,
        @Inject(Helper.INJECT_NAME) private helper: IHelper

    ) { }

    async createCoupon(couponInfo: Coupon, session?: ClientSession): Promise<Coupon> {
        if (session) {
            this.couponRepo.addSession(session)

            this.serviceRepo.addSession(session)
            this.businessRepo.addSession(session)
        }
        //generate code
        var couponCodes = this.helper.generateCouponCodes(couponInfo.maxAmount ?? 100)
        couponInfo.couponCodes = couponCodes

        var result = await this.couponRepo.add(couponInfo)
        //update service and business tables
        var serviceUpdateResult = await this.serviceRepo.updateWithFilter({ _id: couponInfo.service }, { $push: { coupons: result._id } }, false)
        var businessUpdateREsult = await this.businessRepo.updateWithFilter({ _id: couponInfo.business }, { $push: { coupons: result._id } }, false)

        return result
    }

    async getActiveCoupons(endDate: Date, page: number = 1, pageSize: number = 100): Promise<CouponDTO[]> {
        var result = await this.couponRepo.getActiveCoupons(endDate, page, pageSize)
        return result

    }

    async getCouponDetails(couponId: String): Promise<CouponDTO> {
        var result = await this.couponRepo.get(couponId, [
            "business",
            {
                path: "service", populate: { path: "serviceItems", model: "ServiceItem" },
            },
        ])
        const { service, business, ...rest } = result
        var serviceDTOResult = (service as Service[]).map(ser =>{
            const {serviceItems , ...rest} = ser;
            var products = (serviceItems as ServiceItem[]).map(item => new ProductDTO({serviceItem : item}))
            return new ServiceDTO({ service: rest , serviceItems : products })
        })
        var couponsDtoResult = new CouponDTO({ couponInfo: rest, services: serviceDTOResult, business: business as Business })
        return couponsDtoResult 

    }

    async updateCouponCodeStatus(couponId: String, couponCode: CouponCode): Promise<Boolean> {
        var couponInfo = await this.couponRepo.get(couponId)
        if (couponInfo) {
            var index = couponInfo.couponCodes.findIndex(code => code.value == couponCode.value)
            if (index == -1) return false

            couponInfo.couponCodes[index] = couponCode
            var updateResult = await this.couponRepo.update({ _id: couponId }, couponInfo)
            return updateResult;
        }
        return false
    }
}