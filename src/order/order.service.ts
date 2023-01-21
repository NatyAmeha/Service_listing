import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection } from 'mongoose';
import { Coupon } from 'src/model/coupon.model';
import { Order } from 'src/model/order.model';
import { ServiceItem } from 'src/model/service_item.model';
import { BusinessRepository, IBusinessRepo } from 'src/repo/business.repo';
import { CouponRepository, ICouponRepo } from 'src/repo/coupon.repo';
import { IOrderRepo, OrderRepository } from 'src/repo/order.repo';
import { IServiceRepo, ServiceRepository } from 'src/repo/service.repo';
import { Helper, IHelper } from 'src/utils/helper';
import * as _ from 'lodash'
import { IServiceItemRepo, ServiceItemRepository } from 'src/repo/service_item.repo';
import { OrderDTO } from 'src/dto/order.dto';
import { Business } from 'src/model/business.model';

@Injectable()
export class OrderService {
    constructor(
        @Inject(OrderRepository.injectName) private orderRepo: IOrderRepo,
        @Inject(CouponRepository.injectName) private couponRepo: ICouponRepo,
        @Inject(ServiceRepository.injectName) private serviceRepo: IServiceRepo,
        @Inject(ServiceItemRepository.injectName) private serviceItemRepo: IServiceItemRepo,
        @Inject(BusinessRepository.injectName) private businessRepo: IBusinessRepo,
        @Inject(Helper.INJECT_NAME) private helper: IHelper

    ) { }

    async makeOrder(orderInfo: Order, session?: ClientSession): Promise<Order> {
        if (session) {
            this.couponRepo.addSession(session)
            this.orderRepo.addSession(session)
            this.serviceRepo.addSession(session)
            this.serviceRepo.addSession(session)
            this.businessRepo.addSession(session)
        }
        //check if coupon is applied
        var couponCodeIds = orderInfo.items.map(product => product.coupon)
        if (couponCodeIds.length > 0) {
            // check coupon availability and validity
            var date = new Date(Date.now())
            // generate order code
            var codeResult = await this.helper.generateCode(6, [])
            console.log("code result", codeResult, orderInfo.price)
            orderInfo.code = codeResult

            //check coupon codes
            var validCoupons = await this.couponRepo.getActiveCoupons(date, 1, couponCodeIds.length, couponCodeIds)
            console.log("valid coupon codes", validCoupons)
            if (validCoupons.length > 0) {
                for await (const item of orderInfo.items) {
                    var couponAppliedToServiceItem = validCoupons.find(c => c.couponInfo._id == item.coupon)?.couponInfo

                    if (couponAppliedToServiceItem && item.serviceItem) {
                        //apply coupon codes to the order
                        var productInfo = await this.serviceItemRepo.get(item.serviceItem as String)

                        if (orderInfo.price && productInfo.fixedPrice) {
                            var discountedAmount = (item.qty * productInfo.fixedPrice * couponAppliedToServiceItem.discountAmount) / 100

                            console.log("discount amount 2", productInfo, productInfo.fixedPrice, couponAppliedToServiceItem.discountAmount)
                            orderInfo.price = orderInfo.price - discountedAmount
                        }
                        if (orderInfo.priceRange && productInfo.minPrice && productInfo.maxPrice) {
                            orderInfo.priceRange.min = orderInfo.priceRange.min - (((item.qty * productInfo.minPrice) * couponAppliedToServiceItem.discountAmount)) / 100
                            orderInfo.priceRange.max = orderInfo.priceRange.max - (((item.qty * productInfo.maxPrice) * couponAppliedToServiceItem.discountAmount)) / 100
                        }
                        //update coupon info
                        var codeIndex = couponAppliedToServiceItem.couponCodes.findIndex(cCode => cCode.used == false)
                        if (codeIndex > -1) {
                            couponAppliedToServiceItem.couponCodes[codeIndex].used = true
                            var couponUpdateResult = await this.couponRepo.update({ _id: couponAppliedToServiceItem._id }, couponAppliedToServiceItem)
                            console.log("coupon update result", couponUpdateResult)
                        }
                    }
                }

            }
            console.log("order price", orderInfo.price)
            //save order info
            var result = await this.orderRepo.add(orderInfo)
            return result;
        }
        else {
            // save order info
            var result = await this.orderRepo.add(orderInfo)
            return result;
        }
    }

    async getOrderDetails(orderId: String): Promise<OrderDTO> {
        var result = await this.orderRepo.get(orderId, ["business", "items.serviceItem"])
        const { business, items, ...rest } = result
        result.business = (business as Business)._id
        var orderSaveResult = new OrderDTO({ order: rest, items: items, business: business as Business })
        return orderSaveResult
    }

    async getUserOrders(userId: String): Promise<OrderDTO[]> {
        var result = await this.orderRepo.find({ user: userId })
        var userOrderResult = await result.map(order => new OrderDTO({ order: order }))
        return userOrderResult
    }

    async getBusinessOrders(businessId: String): Promise<OrderDTO[]> {
        var orderREsults = await this.orderRepo.find({ "items.business": businessId }, ["items.serviceItem"])

        var businessOrderResult = await orderREsults.map(order => new OrderDTO({ order: order }))
        return businessOrderResult
    }

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
