import { Inject, Injectable } from "@nestjs/common"
import { BusinessDTO } from "src/dto/business.dto"
import { CouponDTO } from "src/dto/coupon.dto"
import { ReviewDTO } from "src/dto/review.dto"
import { SearchDTO } from "src/dto/search.dto"
import { ServiceDTO } from "src/dto/service.dto"
import { ServiceItemDTO } from "src/dto/service_item.dto"
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

export interface ISearchHandler {
    setNextHandler(handler: ISearchHandler): void
    search(query: string, previousData?: SearchDTO, user?: User): Promise<SearchDTO>
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

    async search(query: string, previousData?: SearchDTO, user?: User): Promise<SearchDTO> {
        var appendedSearchData: SearchDTO = {}
        var serviceResult: Service[] = []
        serviceResult = await this.serviceRepo.search(query, 100, ['reviews', 'coupons'])
        if (serviceResult.length == 0) {
            var topServices = await this.serviceRepo.findandSort({}, { viewCount: -1 }, 10, 1, ['reviews', 'coupons'])
            serviceResult = topServices
        }

        var serviceDTOResult = serviceResult.map(service => {
            const { reviews, coupons, ...rest } = service
            var totalRating = this.helper.calculateRating(reviews as Review[])
            var reviewDTO = new ReviewDTO({ reviews: reviews as Review[], rating: totalRating })
            var couponsInfo = coupons.map(coupon => new CouponDTO({ couponInfo: coupon }))
            return new ServiceDTO({ serviceInfo: rest, reviewInfo: reviewDTO, coupons: couponsInfo })
        })
        var searchData: SearchDTO = { services: serviceDTOResult }
        appendedSearchData = { ...previousData, ...searchData }


        if (this.nextSearchHandler) {

            return await this.nextSearchHandler.search(query, appendedSearchData, user)
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

    async search(query: string, previousData?: SearchDTO, user?: User): Promise<SearchDTO> {
        var appendedSearchData: SearchDTO = {}
        var businessResult: Business[] = []
        businessResult = await this.businessRepo.search(query, 100, ['reviews'])
        if (businessResult.length == 0) {
            var topBusinesses = await this.businessRepo.findandSort({}, { likeCount: -1 }, 10, 1, ['reviews'])

            businessResult = topBusinesses
        }

        var businessDTOResult = businessResult.map(business => {
            const { reviews, ...rest } = business
            var totalRating = this.helper.calculateRating(reviews as Review[])
            var reviewDTO = new ReviewDTO({ reviews: reviews as Review[], rating: totalRating })
            return new BusinessDTO({ businessInfo: rest, reviewInfo: reviewDTO })
        })
        var searchData: SearchDTO = { businesses: businessDTOResult }
        appendedSearchData = { ...previousData, ...searchData }

        if (this.nextSearchHandler) {
            return await this.nextSearchHandler.search(query, appendedSearchData, user)
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
    ) {
    }

    setNextHandler(handler: ISearchHandler): void {
        this.nextSearchHandler = handler
    }

    async search(query: string, previousData?: SearchDTO, user?: User): Promise<SearchDTO> {
        var productResult : ServiceItem[] = []
        productResult = await this.serviceItemRepo.search(query , 100)
        if(productResult.length == 0){
           var topServiceItem = await  this.serviceItemRepo.findandSort({} , {viewCount : -1} , 10 , 1)
           productResult = topServiceItem
        }
        var productDTOResult = productResult.map(product => new ServiceItemDTO({ serviceItem: product }))
        var searchData: SearchDTO = { products: productDTOResult }
        var appendedSearchData: SearchDTO = { ...previousData, ...searchData }

        if (this.nextSearchHandler) {
            return await this.nextSearchHandler.search(query, appendedSearchData, user)
        }
        else return appendedSearchData
    }
}