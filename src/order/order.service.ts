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
import { OrderDTO, OrderStatusDTO } from 'src/dto/order.dto';
import { Business } from 'src/model/business.model';
import { OrderStatus } from 'src/utils/constants';
import { UserDTO } from 'src/dto/user.dto';
import { User } from 'src/model/user.model';

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

    async makeOrder(orderInfo: Order , user : User, session?: ClientSession): Promise<Order> {
        if (session) {
            this.couponRepo.addSession(session)
            this.orderRepo.addSession(session)
            this.serviceRepo.addSession(session)
            this.serviceRepo.addSession(session)
            this.businessRepo.addSession(session)
        }
        //check if coupon is applied
        orderInfo.status = OrderStatus.PENDING.toString()
        var couponCodeIds = orderInfo.items.map(product => product.coupon)
        if (couponCodeIds.length > 0) {
            // check coupon availability and validity
            var date = new Date(Date.now())
            // generate order code
            var codeResult = await this.helper.generateCode(6, [], "0123456789")
            
            console.log("total price before discount" , orderInfo.price)
            orderInfo.code = codeResult

            //check coupon codes
            var validCoupons = await this.couponRepo.getActiveCoupons(date, 1, couponCodeIds.length, couponCodeIds)
            console.log("valid coupon codes", validCoupons)
            if (validCoupons.length > 0) {
                for await (const item of orderInfo.items) {
                    var couponAppliedToProduct = validCoupons.find(c => c.couponInfo._id == item.coupon)?.couponInfo

                    if (couponAppliedToProduct && item.serviceItem) {
                        //apply coupon codes to the order
                        var productInfo = await this.serviceItemRepo.get(item.serviceItem as String)

                        if (orderInfo.price && productInfo.fixedPrice) {
                            var discountedAmount = ((item.qty * item.price) * couponAppliedToProduct.discountAmount) / 100
                            console.log("price before discount" , orderInfo.price)
                            orderInfo.price = orderInfo.price - discountedAmount
                            console.log("discount amount 2", discountedAmount , orderInfo.price , couponAppliedToProduct.discountAmount)
                        }
                        if (orderInfo.priceRange && productInfo.minPrice && productInfo.maxPrice) {
                            orderInfo.priceRange.min = orderInfo.priceRange.min - (((item.qty * productInfo.minPrice) * couponAppliedToProduct.discountAmount)) / 100
                            orderInfo.priceRange.max = orderInfo.priceRange.max - (((item.qty * productInfo.maxPrice) * couponAppliedToProduct.discountAmount)) / 100
                        }
                        //update coupon info
                        var codeIndex = couponAppliedToProduct.couponCodes.findIndex(cCode => cCode.used == false)
                        if (codeIndex > -1) {
                            couponAppliedToProduct.totalUsed = (couponAppliedToProduct.totalUsed ?? 0) + 1
                            couponAppliedToProduct.couponCodes[codeIndex].used = true
                            var couponUpdateResult = await this.couponRepo.update({ _id: couponAppliedToProduct._id }, couponAppliedToProduct)
                            console.log("coupon update result", couponUpdateResult)
                        }
                    } 
                }   

            }
            console.log("order price", orderInfo.price)
            //save order info
            orderInfo.user = user._id;
            var result = await this.orderRepo.add(orderInfo)
            return result; 
        }   
        else { 
            // save order info
            var result = await this.orderRepo.add(orderInfo)
            return result;
        }
    }

    async updateOrderStatus(orderId: String, orderStatusInfo: OrderStatusDTO): Promise<Boolean> {
        var updateInfo: { status: String, price?: number } = { status: orderStatusInfo.status }
        if (orderStatusInfo.finalPrice) {
            updateInfo.price = orderStatusInfo.finalPrice
        }
        var orderUpdateResult = await this.orderRepo.updateWithFilter({ user: orderId }, updateInfo)
        return orderUpdateResult
    }

    async getOrderDetails(orderId: String): Promise<OrderDTO> {
        var result = await this.orderRepo.get(orderId, ["business"  , "items.service", "items.serviceItem"])
        const { business, items,    ...rest } = result
        
        var orderSaveResult = new OrderDTO({ order: rest, items: items, business: business as Business as Business })
        return orderSaveResult   
    }

    async getUserOrders(user: User): Promise<UserDTO> {
        
        var result = await this.orderRepo.find({ _id : {$in : user.orders} })
        var orderDTOList = await result.map(order => new OrderDTO({ order: order }))
        var userOrdeResult = new UserDTO({orders : orderDTOList})
        console.log(userOrdeResult)
        return userOrdeResult 
    }

    async getBusinessOrders(businessIds: String[]): Promise<OrderDTO[]> {
        var orders: OrderDTO[] = []
        for await (const bId of businessIds) {
            var orderREsults = await this.orderRepo.find({ "items.business": bId }, ["items.serviceItem"])
            var businessOrderResult = await orderREsults.map(order => new OrderDTO({ order: order }))
            orders.push(...businessOrderResult)
        }
        return orders 
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
