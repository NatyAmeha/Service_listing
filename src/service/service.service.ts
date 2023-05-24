import { Inject, Injectable } from '@nestjs/common';
import mongoose, { ClientSession, Types } from 'mongoose';
import { ReviewDTO } from 'src/dto/review.dto';
import { ServiceDTO } from 'src/dto/service.dto';
import { ProductDTO } from 'src/dto/service_item.dto';
import { Business } from 'src/model/business.model';
import { Review } from 'src/model/review.model';
import { Service } from 'src/model/service.model';
import { ServiceItem } from 'src/model/service_item.model';
import { BusinessRepository, IBusinessRepo } from 'src/repo/business.repo';
import { IReviewRepo, ReviewRepository } from 'src/repo/review.repo';
import { IServiceRepo, ServiceRepository } from 'src/repo/service.repo';
import { IServiceItemRepo, ServiceItemRepository } from 'src/repo/service_item.repo';
import { ReviewService } from 'src/review/review.service';
import { Helper, IHelper } from 'src/utils/helper';
import * as _ from "lodash"
import { Coupon } from 'src/model/coupon.model';
import { CouponDTO } from 'src/dto/coupon.dto';
import { User } from 'src/model/user.model';
import { BusinessDTO } from 'src/dto/business.dto';
import { ITransactionRepo, TransactionRepository } from 'src/repo/transaction.repo';
import { IWalletRepo, WalletRepository } from 'src/repo/wallet.repo';
import { WalletService } from 'src/wallet/wallet.service';
import { Order } from 'src/model/order.model';
import { OrderStatus } from 'src/utils/constants';

@Injectable()
export class ServiceService {
    constructor(@Inject(ServiceRepository.injectName) private serviceRepo: IServiceRepo,
        @Inject(BusinessRepository.injectName) private businessRepo: IBusinessRepo,
        @Inject(ServiceItemRepository.injectName) private serviceItemRepo: IServiceItemRepo,
        @Inject(ReviewRepository.injectName) private reviewRepo: IReviewRepo,
        @Inject(TransactionRepository.injectName) private transactionRepo: ITransactionRepo,
        @Inject(WalletRepository.injectName) private walletRepo: IWalletRepo,
        private reviewService: ReviewService,
        private walletService: WalletService,
        @Inject(Helper.INJECT_NAME) private helper: IHelper,
    ) {

    }

    async createService(serviceInfo: Service, session?: ClientSession): Promise<Service> {
        // add trnasaction session
        if (session) {
            this.serviceRepo.addSession(session)
            this.businessRepo.addSession(session)
        }
        //create service

        var serviceResult = await this.serviceRepo.add(serviceInfo)
        // update business
        var updateBusinessResult = await this.businessRepo.updateWithFilter({ _id: serviceInfo.business }, { $push: { services: serviceResult._id, servicesName: serviceResult.name } })
        return serviceResult
    }

    async createServiceItem(serviceItemInfo: ServiceItem, session?: ClientSession): Promise<ServiceItem> {
        if (session) {
            this.serviceRepo.addSession(session)
            this.serviceItemRepo.addSession(session)
        }
        //add service item
        const { _id, ...restServiceItemInfo } = serviceItemInfo
        var result = await this.serviceItemRepo.add(restServiceItemInfo)
        // update service 
        var serviceUpdateResult = await this.serviceRepo.updateWithFilter({ _id: result.service }, { $push: { serviceItems: result._id } })
        return result
    }

    async editService(id: String, serviceInfo: Service, session?: ClientSession): Promise<Boolean> {
        if (session) {
            this.serviceItemRepo.addSession(session)
        }
        //add service item
        var updateResult = await this.serviceRepo.update({ _id: id }, serviceInfo)
        return updateResult
    }

    async createReview(reviewInfo: Review, user: User, session: ClientSession): Promise<Review> {
        this.reviewRepo.addSession(session)
        this.serviceRepo.addSession(session)
        this.businessRepo.addSession(session)
        this.transactionRepo.addSession(session)
        this.walletRepo.addSession(session)

        reviewInfo.user = user._id
        reviewInfo.username = user.username
        reviewInfo.profileImage = user.profileImage
        reviewInfo.dateCreated = new Date(Date.now())
        const { _id, ...rest } = reviewInfo
        var reviewCreateResult = await this.reviewRepo.upsert({ user: user._id, service: reviewInfo.service }, rest)

        var serviceUpdateResult = await this.serviceRepo.updateWithFilter({ _id: reviewInfo.service }, { $addToSet: { reviews: reviewCreateResult._id } })
        var businessUpdateREsult = await this.businessRepo.updateWithFilter({ _id: reviewInfo.business }, { $addToSet: { reviews: reviewCreateResult._id } })

        var pendingTransactions = await this.transactionRepo.getPendingDiscountTransaction(reviewInfo.service)
        if (pendingTransactions.length > 0) {
            console.log("pending transaction", pendingTransactions)
            for await (const transaction of pendingTransactions) {
                var order = transaction.order as Order
                var selectedItem = order.items.find(item => item.serviceItem == transaction.product.toString())
                if (selectedItem && selectedItem.deliveryStatus == OrderStatus.COMPLETED) {
                    var result = await this.walletService.sendRewardToWallet(user._id, transaction.amount, transaction, session)
                    console.log("transaction complete", result)
                }

            }
        }
        return reviewCreateResult
    }

    async updateReview(reviewId: String, newReviewInfo: Review, userId: String, session: ClientSession): Promise<Boolean> {
        this.reviewRepo.addSession(session)
        this.transactionRepo.addSession(session)
        newReviewInfo.dateCreated = new Date(Date.now())
        var reviewUpdateResult = await this.reviewRepo.update({ _id: reviewId }, newReviewInfo)
        var pendingTransactions = await this.transactionRepo.getPendingDiscountTransaction(newReviewInfo.service)
        if (pendingTransactions.length > 0) {
            console.log("pending transaction update", pendingTransactions)
            for await (const transaction of pendingTransactions) {
                var order = transaction.order as Order

                var selectedItem = order.items.find(item => item.serviceItem == transaction.product.toString())
                if (selectedItem && selectedItem.deliveryStatus == OrderStatus.COMPLETED) {
                    var result = await this.walletService.sendRewardToWallet(userId, transaction.amount, transaction, session)
                    console.log("transaction update complete", result)
                }

            }
        }
        return reviewUpdateResult
    }

    async getServiceReviews(serviceId: String, keyPoints?: String[], page?: number, size?: number, star: number = -1): Promise<ReviewDTO> {

        var serviceReviews = await this.reviewService.getHighlevelReviewInfo({ service: serviceId }, keyPoints, page, size, true, star)
        // console.log("service reviews" , serviceReviews , serviceId)
        // var rating = this.helper.calculateRating(serviceReviews, keyPoints)
        // var reviewDTOResult = new ReviewDTO({ rating: rating, reviews: _.take(serviceReviews, 10) })
        return serviceReviews
    }




    async editServiceItem(id: String, serviceItemInfo: ServiceItem, session?: ClientSession): Promise<Boolean> {
        if (session) {
            this.serviceItemRepo.addSession(session)
        }
        //add service item
        var updateResult = await this.serviceItemRepo.update({ _id: id }, serviceItemInfo)
        return updateResult
    }

    async updateServiceStatus(id: String, serviceStatus: Boolean): Promise<Boolean> {
        var updateResult = await this.serviceRepo.updateWithFilter({ _id: id }, { active: serviceStatus })
        return updateResult
    }

    async getSimpleServiceInfo(serviceId: String): Promise<Service> {
        var result = await this.serviceRepo.get(serviceId)
        return result;
    }

    async getServiceDetails(id: String): Promise<ServiceDTO> {

        var serviceInfo = await this.serviceRepo.get(id, ['serviceItems', "business", "coupons"])
        //get related services
        var relatedService = await this.serviceRepo.getRelatedServices(serviceInfo)
        const { coupons, business, reviews, serviceItems, ...rest } = serviceInfo
        var isBusinessVerified = Helper.isBusinessVerfied(business as Business)
        var couponsDTO = this.helper.filterActiveCoupons(coupons as Coupon[])
        var businessInfo = business as Business
        var result = new ServiceDTO({
            verified: isBusinessVerified,
            service: rest as Service, relatedServices: relatedService,
            business: new BusinessDTO({ businessInfo: businessInfo }),
            coupons: couponsDTO
        })

        if (serviceItems?.length > 0) {
            var productsInsideService = (serviceItems as ServiceItem[])?.map(item => new ProductDTO({
                serviceItem: item, verified: isBusinessVerified,
                priceRange: Helper.calculateProductPrice(item)
            })) 
            result.serviceItems = productsInsideService;
        }



        //update serviceview count
        var updateResult = await this.serviceRepo.updateWithFilter({ _id: id }, { $inc: { viewCount: 1 } })

        //get review info
        var reviewResult = await this.reviewService.getHighlevelReviewInfo({ service: id }, null, 1, 5)
        result.reviewInfo = reviewResult

        return result;
    }



    async getServiceItemDetails(serviceItemId: String, userInfo?: User): Promise<ProductDTO> {
        var itemResult = await this.serviceItemRepo.get(serviceItemId, ["business", {
            path: "service", populate: { path: "coupons", model: "Coupon" },
        }
        ])
        const { service, business, ...rest } = itemResult
        const { coupons, ...restServcie } = service as Service
        var couponInfo = this.helper.filterActiveCoupons(coupons as Coupon[])
        var relatedProducts = await this.getRelatedProducts(rest.name.split(" "), rest.category)
        var serviceReviewInfo = await this.reviewService.getHighlevelReviewInfo({ service: restServcie._id })
        var serviceInfo = new ServiceDTO({
            service: restServcie as Service, reviewInfo: serviceReviewInfo
        })
        var result = new ProductDTO({
            serviceItem: rest, serviceInfo: serviceInfo, couponsInfo: couponInfo,
            businessInfo: business as Business, relatedProducts: relatedProducts,
            priceRange: Helper.calculateProductPrice(rest)
        })
        if (userInfo) {
            var isProductInUserFavorite = (userInfo.favoriteProducts as String[]).find(productId => productId.toString() == serviceItemId.toString())
            if (isProductInUserFavorite != null)
                result.favorite = true
            else result.favorite = false;
        }

        return result;
    }

    async getRelatedProducts(query: String[], category: String): Promise<ProductDTO[]> {
        var products: ServiceItem[] = []
        var productsWithSimilarCategory = await this.serviceItemRepo.find({ category: category }, [
            { path: "business", model: "Business", selected: { subscription: 1, _id: 1, name: 1 }, },
            {
                path: "service", populate: { path: "coupons", model: "Coupon" },
            },

        ])
        products.push(...productsWithSimilarCategory)
        var producttsBySimilarName = await this.serviceItemRepo.find({ name: { $in: query } }, [
            { path: "business", model: "Business", selected: { subscription: 1, _id: 1, name: 1 }, },
            {
                path: "service", populate: { path: "coupons", model: "Coupon" },
            }
        ])
        products.push(...producttsBySimilarName)

        var uniqueProductResult = _.uniqBy(products, product => product._id.toString())
        return await Promise.all(uniqueProductResult.map(async product => {
            const { business, service, ...rest } = product
            const { coupons, ...restServcie } = service as Service
            var couponInfo = this.helper.filterActiveCoupons(coupons as Coupon[])
            var isProductVerified = Helper.isBusinessVerfied(business as Business)
            var serviceReviewInfo = await this.reviewService.getHighlevelReviewInfo({ service: restServcie._id })
            var serviceInfo = new ServiceDTO({
                service: restServcie as Service, reviewInfo: serviceReviewInfo
            })
            return new ProductDTO({
                serviceItem: rest, serviceInfo: serviceInfo, couponsInfo: couponInfo,
                businessInfo: business as Business, verified: isProductVerified,
                priceRange: Helper.calculateProductPrice(rest)
            })

        }))
    }

    async getServices(query?: String, pageIndex: number = 1, pageSize: number = 20): Promise<ServiceDTO[]> {
        var services: Service[] = []
        if (query) {
            services = await this.serviceRepo.find({ name: query }, ['serviceItems', "business"], 10)
        }
        else {
            services = await this.serviceRepo.find({}, ['serviceItems', "business"], 10)
        }
        var result = services.map(ser => new ServiceDTO({ service: ser }))
        return result;
    }



}
