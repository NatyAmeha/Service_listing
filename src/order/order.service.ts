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
import { CouponType, OrderStatus, TransactionAction, TransactionStatus, TransactionType } from 'src/utils/constants';
import { UserDTO } from 'src/dto/user.dto';
import { User } from 'src/model/user.model';
import { Service } from 'src/model/service.model';
import { Review } from 'src/model/review.model';
import { IReviewRepo, ReviewRepository } from 'src/repo/review.repo';
import { WalletRepository } from 'src/repo/wallet.repo';
import { TransactionRepository } from 'src/repo/transaction.repo';
import { Transaction } from 'src/model/transaction.model';
import { WalletService } from 'src/wallet/wallet.service';
import { BadRequestException } from '@nestjs/common/exceptions';

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
        private walletService: WalletService,
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
        var totalDiscountByBusinesses = await this.appyDiscountToOrderProvidedByBusinesses(orderInfo, user)
        orderInfo.price = orderInfo.price - totalDiscountByBusinesses;

        orderInfo.items.forEach(item => item._id = new Types.ObjectId().toString())

        //save order info 
        var result = await this.orderRepo.add(orderInfo)
        //save cashback transaction

        // var cashbackTransaction = await this.savecashbackRewardTransaction(orderInfo, user, session);
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

    async updateOrderItemStatus(orderId: String, productId: String, orderSTatus: OrderStatusDTO, session: ClientSession): Promise<Transaction | null> {
        this.orderRepo.addSession(session)
        this.transactionRepo.addSession(session)
        var orderResult = await this.orderRepo.get(orderId)
        if (orderResult) {
            var slectedProductIndex = orderResult.items.findIndex(item => item.serviceItem.toString() == productId)
            if (slectedProductIndex > -1) {
                orderResult.items[slectedProductIndex].deliveryStatus = orderSTatus.status
                var orderUpdateResult = await this.orderRepo.update({ _id: orderResult._id }, orderResult)
                // get pending cashback pending transation
                var pendingCashbacTransaction = await this.transactionRepo.findOne({ product: productId, status: TransactionStatus.PENDING })
                if (pendingCashbacTransaction && orderSTatus.status == OrderStatus.COMPLETED) {
                    pendingCashbacTransaction.status = TransactionStatus.APPROVED
                    await this.transactionRepo.update({ _id: pendingCashbacTransaction._id }, pendingCashbacTransaction)
                    return pendingCashbacTransaction
                }
                else {
                    return null;
                }
            } else {
                return Promise.reject(new BadRequestException("", "No item found with this product id"))
            }
        }
        else {
            return Promise.reject(new BadRequestException("", "Unable to find order with this id"))
        }
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
        console.log(items.map(e => e.selectedDates))

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

    async appyDiscountToOrderProvidedByBusinesses(orderInfo: Order, user: User , session?: ClientSession): Promise<number> {
        var totalDiscount = 0;
        var couponCodeIds = orderInfo.items.map(product => product.coupon)

        if (session) {
            this.transactionRepo?.addSession(session);
        }
        if (couponCodeIds.length > 0) {
            // check coupon availability and validity
            var date = new Date(Date.now())


            //check coupon codes
            var validCoupons = await this.couponRepo.getActiveCoupons(date, 1, couponCodeIds.length, couponCodeIds)
            if (validCoupons.length > 0) {
                for await (const item of orderInfo.items) {
                    var couponAppliedToProduct = validCoupons.find(c => c.couponInfo._id == item.coupon)?.couponInfo

                    if (couponAppliedToProduct && item.serviceItem) {
                        var productInfo = await this.serviceItemRepo.get(item.serviceItem as String)
                        if (couponAppliedToProduct.couponType == CouponType.DISCOUNT.toString()) {
                            //apply coupon codes to the order

                            if (orderInfo.price && productInfo.fixedPrice) {
                                var discountedAmount = ((item.qty * item.price) * couponAppliedToProduct.discountAmount) / 100
                                console.log("price before discount", orderInfo.price)
                                // orderInfo.price = orderInfo.price - discountedAmount
                                totalDiscount += discountedAmount
                                console.log("discount amount 2", discountedAmount, orderInfo.price, couponAppliedToProduct.discountAmount)
                            }
                        }
                        else if (couponAppliedToProduct.couponType == CouponType.CASHBACK.toString()) {
                            console.log("cashback coupon" , item.serviceItem)
                            var cashbackReward = ((item.price * 10) / 100) * (item.qty ?? 1);
                            cashbackReward = cashbackReward > 100 ? 100 : cashbackReward
                            var transaction = new Transaction({
                                amount: cashbackReward,
                                sourceName: `Cashback reward from ${productInfo?.businessName }`,
                                recepient: user._id,
                                description: `You got a cashback reward by ordering ${productInfo.name} from ${productInfo.businessName}`,
                                recepientName: user.username,
                                order: orderInfo._id,
                                service: item.service as String,
                                product: item.serviceItem,
                                action: TransactionAction.REVIEW,
                                status: TransactionStatus.PENDING,
                                type: TransactionType.DISCOUNTCASHBACK,
                                dateCreated: new Date(Date.now())
        
                                // description : `You got ${discountedAmount} Birr discount cashback by  `
                            })
                            var transactionSaveResult = await this.transactionRepo.add(transaction)
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

        }
        return totalDiscount;
    }

    async savecashbackRewardTransaction(orderInfo: Order, user: User, session?: ClientSession): Promise<boolean> {
        // add cashback transaction
        if (session) {
            this.transactionRepo?.addSession(session);
        }
        var date = new Date(Date.now())


        for await (const item of orderInfo.items) {
            var productInfo = await this.serviceItemRepo.get(item.serviceItem as String)

            var validCoupons = await this.couponRepo.getActiveCoupons(date, 1, 1, [item.coupon])
            if (validCoupons.length > 0) {
                var selecctedCoupon = validCoupons[0]
                if (selecctedCoupon.couponInfo.couponType == CouponType.CASHBACK.toString()) {
                    var cashbackReward = ((item.price * 10) / 100) * (item.qty ?? 1);
                    cashbackReward = cashbackReward > 100 ? 100 : cashbackReward
                    var transaction = new Transaction({
                        amount: cashbackReward,
                        sourceName: `Cashback reward from ${productInfo.businessName}`,
                        recepient: user._id,
                        description: `You got a cashback reward by ordering ${productInfo.name} from ${productInfo.businessName}`,
                        recepientName: user.username,
                        order: orderInfo._id,
                        service: item.service as String,
                        product: item.serviceItem,
                        action: TransactionAction.REVIEW,
                        status: TransactionStatus.PENDING,
                        type: TransactionType.DISCOUNTCASHBACK,
                        dateCreated: new Date(Date.now())

                        // description : `You got ${discountedAmount} Birr discount cashback by  `
                    })
                    var transactionSaveResult = await this.transactionRepo.add(transaction)
                }
            }


        }
        return true;


    }

}
