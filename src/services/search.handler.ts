import { Inject, Injectable } from "@nestjs/common"
import { BusinessDTO } from "src/dto/business.dto"
import { CouponDTO } from "src/dto/coupon.dto"
import { ReviewDTO } from "src/dto/review.dto"
import { SearchDTO } from "src/dto/search.dto"
import { ServiceDTO } from "src/dto/service.dto"
import { ProductDTO } from "src/dto/service_item.dto"
import { Business } from "src/model/business.model"
import { Coupon } from "src/model/coupon.model"
import { Review } from "src/model/review.model"
import { Service } from "src/model/service.model"
import { ServiceItem } from "src/model/service_item.model"
import { User } from "src/model/user.model"
import { BusinessRepository, IBusinessRepo } from "src/repo/business.repo"
import { IServiceRepo, ServiceRepository } from "src/repo/service.repo"
import { IServiceItemRepo, ServiceItemRepository } from "src/repo/service_item.repo"
import { Helper, IHelper } from "src/utils/helper"
import * as _ from "lodash"
import { rest } from "lodash"
import { SortOption } from "src/utils/constants"
import { ReviewService } from "src/review/review.service"

export interface ISearchHandler {
    setNextHandler(handler: ISearchHandler): void
    search(query: string, additionalQueryInfo?: any, sortBy?: any, previousData?: SearchDTO, user?: User): Promise<SearchDTO>
}


@Injectable()
export class ServiceSearchHandler implements ISearchHandler {
    static INJECT_NAME = "SERVICE_SEARCH_HANDLER"
    private nextSearchHandler?: ISearchHandler

    constructor(
        @Inject(ServiceRepository.injectName) private serviceRepo: IServiceRepo,
        @Inject(Helper.INJECT_NAME) private helper: IHelper
    ) {
    }

    setNextHandler(handler: ISearchHandler): void {
        this.nextSearchHandler = handler
    }

    async search(query: string, additionalQueryInfo?: any, sortBy?: any, previousData?: SearchDTO, user?: User): Promise<SearchDTO> {
        var appendedSearchData: SearchDTO = {}
        var serviceResult: Service[] = []
        var exactResult = true

        serviceResult = await this.serviceRepo.search(query, additionalQueryInfo, {}, 100, ['reviews', "business", "serviceItems", , 'coupons'])
        if (serviceResult.length == 0) {
            var topServices = await this.serviceRepo.findandSort({}, { viewCount: -1 }, 10, 1, ['reviews', 'business', "serviceItems", 'coupons'])
            serviceResult = topServices
            exactResult = false;
        }

        var serviceDTOResult = serviceResult.map(service => {
            const { reviews, serviceItems, coupons, business, ...rest } = service
            var ratingInfo = this.helper.calculateRating(reviews as Review[])
            var reviewDTO = new ReviewDTO({ rating: ratingInfo.rating, count: ratingInfo.count })

            var couponsInfo = _.orderBy(this.helper.filterActiveCoupons(coupons as Coupon[]), coupon => coupon.couponInfo.discountAmount, "desc")

            var productsInsideService = (serviceItems as ServiceItem[])?.map(item => new ProductDTO({ serviceItem: item, priceRange: Helper.calculateProductPrice(item) }))

            return new ServiceDTO({
                service: rest, serviceItems: productsInsideService
                , reviewInfo: reviewDTO, coupons: couponsInfo,
                verified: Helper.isBusinessVerfied(business as Business)
            })

        })

        serviceDTOResult = serviceDTOResult.filter(service => service.verified == true)
        if (sortBy == SortOption.PRICE) {
            serviceDTOResult = _.orderBy(serviceDTOResult, serviceDto => {
                var products = serviceDto.serviceItems.map(e => e.serviceItem)
                return this.helper.calculateServicePriceRange(products).min
            })
        }
        else if (sortBy == SortOption.RATING) {
            serviceDTOResult = _.orderBy(serviceDTOResult, serviceDto => serviceDto.reviewInfo.rating, "desc")
        }

        var searchData: SearchDTO = { services: serviceDTOResult, exactServiceSearch: exactResult }
        appendedSearchData = { ...previousData, ...searchData }


        if (this.nextSearchHandler) {

            return await this.nextSearchHandler.search(query, additionalQueryInfo, sortBy, appendedSearchData, user)
        }
        else return appendedSearchData
    }
}

@Injectable()
export class BusinessSearchHandler implements ISearchHandler {
    static INJECT_NAME = "BUSINESS_SEARCH_HANDLER"
    private nextSearchHandler?: ISearchHandler

    constructor(
        @Inject(BusinessRepository.injectName) private businessRepo: IBusinessRepo,
        @Inject(Helper.INJECT_NAME) private helper: IHelper
    ) {
    }

    setNextHandler(handler: ISearchHandler): void {
        this.nextSearchHandler = handler
    }

    async search(query: string, additionalQueryInfo?: any, sortBy?: any, previousData?: SearchDTO, user?: User): Promise<SearchDTO> {
        var appendedSearchData: SearchDTO = {}
        var businessResult: Business[] = []
        var exactResult = true
        businessResult = await this.businessRepo.search(query, additionalQueryInfo, {}, 100, ['reviews'])
        if (businessResult.length == 0) {
            //fetch businesses using name from products result
            var businessNames = previousData.products.map(p => p.serviceItem.businessName);

            if (businessNames.length > 0) {
                var businesses = await this.businessRepo.find({ name: { $in: _.uniq(businessNames) } }, ['reviews'])
                businessResult = businesses
            }
            else {
                var topBusinesses = await this.businessRepo.findandSort({}, { likeCount: -1 }, 10, 1, ['reviews'])
                businessResult = topBusinesses
                exactResult = false;
            }
        }

        var businessDTOResult = businessResult.filter(business => business.verified == true).map(business => {
            const { reviews, ...rest } = business
            var ratingInfo = this.helper.calculateRating(reviews as Review[])
            var reviewDTO = new ReviewDTO({ rating: ratingInfo.rating, count: ratingInfo.count })
            return new BusinessDTO({ businessInfo: rest, reviewInfo: reviewDTO })
        })
        var searchData: SearchDTO = { businesses: businessDTOResult, exactBusinessSearch: exactResult }
        appendedSearchData = { ...previousData, ...searchData }

        if (this.nextSearchHandler) {
            return await this.nextSearchHandler.search(query, additionalQueryInfo, sortBy, appendedSearchData, user)
        }
        else return appendedSearchData
    }
}


@Injectable()
export class ProductSearchHandler implements ISearchHandler {
    static INJECT_NAME = "PRODUCT_SEARCH_HANDLER"
    private nextSearchHandler?: ISearchHandler


    constructor(
        @Inject(ServiceItemRepository.injectName) private serviceItemRepo: IServiceItemRepo,
        @Inject(Helper.INJECT_NAME) private helper: IHelper,
        private reviewService: ReviewService
    ) {
    }

    setNextHandler(handler: ISearchHandler): void {
        this.nextSearchHandler = handler
    }



    async search(query: string, additionalQueryInfo?: any, sortBy?: any, previousData?: SearchDTO, user?: User): Promise<SearchDTO> {
        var productResult: ServiceItem[] = []
        var exactResult = true
        var sortOption = {}
        if (sortBy == SortOption.PRICE) {
            sortOption = { fixedPrice: 1 }
        }
        productResult = await this.serviceItemRepo.search(query, additionalQueryInfo, sortOption, 100, ["service",
            { path: "service", populate: { path: "coupons", model: "Coupon" }, },
            {
                path: "business", model: "Business", select: { _id: 1, subscription: 1, verified: 1 }
            }
        ])

        if (productResult.length == 0) {
            //fetch businesses using name from products result

            var topProducts = await this.serviceItemRepo.findandSort({}, { viewCount: -1 }, 10, 1,
                [
                    {
                        path: "service", populate: { path: "coupons", model: "Coupon" },
                    },
                    {
                        path: "business", model: "Business", select: { _id: 1, subscription: 1, verified: 1 }
                    }
                ],
            )
            productResult = topProducts
            exactResult = false
        }
        var productDTOResult = await Promise.all(productResult.filter(product => product.visibility == true || product.visibility == null)
            .map(async product => {
                const { service, business, ...rest } = product

                var serviceLevelCoupons = (service as Service).coupons as Coupon[]
                var serviceReviewInfo = await this.reviewService.getHighlevelReviewInfo({ service: (service as Service)._id })
                var serviceInfo = new ServiceDTO({ reviewInfo: serviceReviewInfo })
                var productInfo = new ProductDTO({
                    serviceItem: rest, serviceInfo: serviceInfo,
                    priceRange: Helper.calculateProductPrice(rest),
                    verified: Helper.isBusinessVerfied(business as Business)

                })

                if (serviceLevelCoupons && serviceLevelCoupons.length > 0) {
                    var activeCoupons = this.helper.filterActiveCoupons(serviceLevelCoupons)
                    productInfo.couponsInfo = activeCoupons
                }
                return productInfo
            }))


        var validProuctSearchResult = productDTOResult.filter(product => product.verified == true)


        var searchData: SearchDTO = { products: validProuctSearchResult, exactProductSearch: exactResult }
        var appendedSearchData: SearchDTO = { ...previousData, ...searchData }

        if (this.nextSearchHandler) {
            return await this.nextSearchHandler.search(query, additionalQueryInfo, sortBy, appendedSearchData, user)
        }
        else return appendedSearchData
    }
}