import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection } from 'mongoose';
import { Coupon } from 'src/model/coupon.model';
import { BusinessRepository, IBusinessRepo } from 'src/repo/business.repo';
import { CouponRepository, ICouponRepo } from 'src/repo/coupon.repo';
import { IOrderRepo, OrderRepository } from 'src/repo/order.repo';
import { IServiceRepo, ServiceRepository } from 'src/repo/service.repo';
import { Helper, IHelper } from 'src/utils/helper';

@Injectable()
export class OrderService {
    constructor(
        @Inject(OrderRepository.injectName) private orderRepo: IOrderRepo,
        @Inject(CouponRepository.injectName) private couponRepo: ICouponRepo,
        @Inject(ServiceRepository.injectName) private serviceRepo: IServiceRepo,
        @Inject(BusinessRepository.injectName) private businessRepo: IBusinessRepo,
        @Inject(Helper.INJECT_NAME) private helper : IHelper

    ) { }
    
    async createCoupon(couponInfo: Coupon, session?: ClientSession): Promise<Coupon> {
        if (session) {
            this.couponRepo.addSession(session)
            this.orderRepo.addSession(session)
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

}
