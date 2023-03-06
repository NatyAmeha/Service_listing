import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection, Types } from 'mongoose';
import { Coupon } from 'src/model/coupon.model';
import { Order, OrderItem } from 'src/model/order.model';
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
import { OrderStatus, TransactionAction, TransactionStatus, TransactionType } from 'src/utils/constants';
import { UserDTO } from 'src/dto/user.dto';
import { User } from 'src/model/user.model';
import { Service } from 'src/model/service.model';
import { Review } from 'src/model/review.model';
import { IReviewRepo, ReviewRepository } from 'src/repo/review.repo';
import { WalletRepository } from 'src/repo/wallet.repo';
import { TransactionRepository } from 'src/repo/transaction.repo';
import { Transaction } from 'src/model/transaction.model';

@Injectable()
export class OrderService {
    constructor(
        @Inject(OrderRepository.injectName) private orderRepo: IOrderRepo,
        @Inject(CouponRepository.injectName) private couponRepo: ICouponRepo,
        @Inject(ServiceRepository.injectName) private serviceRepo: IServiceRepo,
        @Inject(ServiceItemRepository.injectName) private serviceItemRepo: IServiceItemRepo,
        @Inject(BusinessRepository.injectName) private businessRepo: IBusinessRepo,
        @Inject(TransactionRepository.injectName) private transactionRepo: TransactionRepository,
        @Inject(Helper.INJECT_NAME) private helper: IHelper,
        @Inject(ReviewRepository.injectName) private reviewRepo: IReviewRepo,

    ) { }

    async makeOrder(orderInfo: Order, user: User, session?: ClientSession): Promise<Order> {
        if (session) {
            this.couponRepo.addSession(session)
            this.orderRepo.addSession(session)
            this.serviceRepo.addSession(session)
            this.serviceRepo.addSession(session)
            this.businessRepo.addSession(session)
            this.transactionRepo.addSession(session)
        }
        //check if coupon is applied

        var orderId = new Types.ObjectId()
        orderInfo._id = orderId.toString()
        orderInfo.status = OrderStatus.PENDING.toString()
        orderInfo.user = user._id;

        var codeResult = await this.helper.generateCode(6, [], "0123456789")

        orderInfo.code = codeResult
        console.log("total price before discount", orderInfo.price)
        var totalDiscountByBusinesses = await this.appyDiscountToOrderProvidedByBusinesses(orderInfo , user)
        orderInfo.price = orderInfo.price - totalDiscountByBusinesses;
        console.log("total price after discount", orderInfo.price)
        //save order info 
        var result = await this.orderRepo.add(orderInfo)
        //save cashback transaction
        var cashbackTransaction = await this.savecashbackRewardTransaction(orderInfo, user, session);
        return result;
    }

    async updateOrderStatus(orderCode: String, orderStatusInfo: OrderStatusDTO): Promise<Boolean> {
        // find order and update status by order code
        var orderResult = await this.orderRepo.findOne({ code: orderCode })
        if (orderResult) {
            var orderUpdateResult = await this.orderRepo.updateWithFilter({ user: orderResult._id }, orderStatusInfo)
        }

        return orderUpdateResult
    }


    async getOrderDetails(orderId: String, user: User): Promise<OrderDTO> {
        var reviews: Review[] = []
        var result = await this.orderRepo.get(orderId, ["items.business", "items.service", "items.serviceItem"])
        const { items, ...rest } = result



        //get user service reviews inside the order

        var servicesIDInOrder = result.items.map(item => (item.service as Service)._id) as String[]
        var businessesInOrder = result.items.map(item => (item.business) as Business)
        var uniqBusinesses = _.uniqBy(businessesInOrder, business => business._id.toString())
        for await (const id of _.uniq(servicesIDInOrder)) {
            var review = await this.reviewRepo.findOne({ user: user._id, service: id })

            if (review) {
                reviews.push(review)
            }
        }

        // change business object to business id in items
        items.forEach(item => item.business = (item.business as Business)._id.toString())

        var orderSaveResult = new OrderDTO({
            order: rest, items: items,
            businesses: uniqBusinesses, userServiceReviews: reviews
        })
        return orderSaveResult
    }

    async getUserOrders(user: User): Promise<UserDTO> {

        var results = await this.orderRepo.find({ _id: { $in: user.orders } })
        var sortedResult = _.orderBy(results, order => order.dateCreated, "desc")
        var orderDTOList = await sortedResult.map(order => new OrderDTO({ order: order }))
        var userOrdeResult = new UserDTO({ orders: orderDTOList })
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

    async appyDiscountToOrderProvidedByBusinesses(orderInfo: Order , user : User): Promise<number> {
        var totalDiscount = 0;
        var couponCodeIds = orderInfo.items.map(product => product.coupon)
        if (couponCodeIds.length > 0) {
            // check coupon availability and validity
            var date = new Date(Date.now())
           

            //check coupon codes
            var validCoupons = await this.couponRepo.getActiveCoupons(date, 1, couponCodeIds.length, couponCodeIds)
            if (validCoupons.length > 0) {
                for await (const item of orderInfo.items) {
                    var couponAppliedToProduct = validCoupons.find(c => c.couponInfo._id == item.coupon)?.couponInfo

                    if (couponAppliedToProduct && item.serviceItem) {
                        //apply coupon codes to the order
                        var productInfo = await this.serviceItemRepo.get(item.serviceItem as String)

                        if (orderInfo.price && productInfo.fixedPrice) {
                            var discountedAmount = ((item.qty * item.price) * couponAppliedToProduct.discountAmount) / 100
                            console.log("price before discount", orderInfo.price)
                            // orderInfo.price = orderInfo.price - discountedAmount
                            totalDiscount +=discountedAmount
                            console.log("discount amount 2", discountedAmount, orderInfo.price, couponAppliedToProduct.discountAmount)
                        }
                        if (orderInfo.priceRange && productInfo.minPrice && productInfo.maxPrice) {
                            orderInfo.priceRange.min = orderInfo.priceRange.min - (((item.qty * productInfo.minPrice) * couponAppliedToProduct.discountAmount)) / 100
                            orderInfo.priceRange.max = orderInfo.priceRange.max - (((item.qty * productInfo.maxPrice) * couponAppliedToProduct.discountAmount)) / 100
                        }
                        // create transaction to for discount cashback to be available after review
                        var transaction = new Transaction({
                            amount: discountedAmount,
                            sourceName: `Cash back reward from ${productInfo.businessName}`,
                            recepient: user._id,
                            description: `The discount you got by ordering ${productInfo.serviceName} from ${productInfo.businessName}`,
                            recepientName: user.username,
                            order: orderInfo._id,
                            service: productInfo.service as String,
                            product: productInfo._id,
                            action: TransactionAction.REVIEW,
                            status: TransactionStatus.PENDING,
                            type: TransactionType.DISCOUNTCASHBACK
                            // description : `You got ${discountedAmount} Birr discount cashback by  `
                        })
                        var transactionSaveResult = await this.transactionRepo.add(transaction)

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

        }
        return totalDiscount;
    }

    async savecashbackRewardTransaction(orderinfo: Order, user: User, session?: ClientSession): Promise<boolean> {
        // add cashback transaction
        if (session) {
            this.transactionRepo?.addSession(session);
        }
        for await (const item of orderinfo.items) {
            var cashbackReward = (item.price * 10) / 100;
            cashbackReward = cashbackReward > 50 ? 50 : cashbackReward
            var transaction = new Transaction({
                amount: cashbackReward,
                sourceName: `Cashback reward from Komkum`,
                recepient: user._id,
                description: `You got a cashback by ordering product/service from Komkum`,
                recepientName: user.username,
                order: orderinfo._id,
                product: item.serviceItem,
                action: TransactionAction.ORDER_COMLETION,
                status: TransactionStatus.PENDING,
                type: TransactionType.CASHBACK
                // description : `You got ${discountedAmount} Birr discount cashback by  `
            })
            var transactionSaveResult = await this.transactionRepo.add(transaction)
        }
        return true;


    }

}
