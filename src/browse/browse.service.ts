import { Inject, Injectable } from '@nestjs/common';
import { BrowseDTO } from 'src/dto/browse.dto';
import { BusinessDTO } from 'src/dto/business.dto';
import { CategoryDTO } from 'src/dto/category.dto';
import { CouponDTO } from 'src/dto/coupon.dto';
import { DashBoardDTO } from 'src/dto/dashboard.dto';
import { ReviewDTO } from 'src/dto/review.dto';
import { SearchDTO } from 'src/dto/search.dto';
import { ServiceDTO } from 'src/dto/service.dto';
import { ProductDTO } from 'src/dto/service_item.dto';
import { Business } from 'src/model/business.model';
import { Category } from 'src/model/category.model';
import { Coupon } from 'src/model/coupon.model';
import { Order } from 'src/model/order.model';
import { Review } from 'src/model/review.model';
import { ServiceItem } from 'src/model/service_item.model';
import { User } from 'src/model/user.model';
import { OrderService } from 'src/order/order.service';
import { BusinessRepository, IBusinessRepo } from 'src/repo/business.repo';
import { CategoryRepository, ICategoryRepo } from 'src/repo/category.repo';
import { CouponRepository, ICouponRepo } from 'src/repo/coupon.repo';
import { IServiceRepo, ServiceRepository } from 'src/repo/service.repo';
import { IServiceItemRepo, ServiceItemRepository } from 'src/repo/service_item.repo';
import { ReviewService } from 'src/review/review.service';
import { BusinessSearchHandler, ISearchHandler, ProductSearchHandler, ServiceSearchHandler } from 'src/services/search.handler';
import { Helper, IHelper } from 'src/utils/helper';

@Injectable()
export class BrowseService {
    constructor(
        @Inject(CouponRepository.injectName) private couponRepo: ICouponRepo,
        @Inject(ServiceItemRepository.injectName) private serviceItemRepo: IServiceItemRepo,
        @Inject(ServiceRepository.injectName) private serviceRepo: IServiceRepo,
        @Inject(BusinessRepository.injectName) private businessRepo: IBusinessRepo,
        @Inject(Helper.INJECT_NAME) private helper: IHelper,
        private reviewService: ReviewService,
        private orderService: OrderService,
        @Inject(ServiceSearchHandler.INJECT_NAME) private serviceSearchHandler: ISearchHandler,
        @Inject(BusinessSearchHandler.INJECT_NAME) private businessSearchHandler: ISearchHandler,
        @Inject(ProductSearchHandler.INJECT_NAME) private productSearchHandler: ISearchHandler,
        @Inject(CategoryRepository.injectName) private categoryRepo: ICategoryRepo
    ) { }

    async getBrowse(): Promise<BrowseDTO> {
        var currentDate = new Date(Date.now())
        var services: String[] = []
        //query active coupons
        var couponResult = await this.couponRepo.getActiveCoupons(currentDate, 1, 10)


        // query featured businesses
        var businessREsult = await this.businessRepo.find({ featured: true })
        var featuredBusinessDTO = await Promise.all(businessREsult.map(async b => {
            var reviewInfo = await this.reviewService.getHighlevelReviewInfo({ business: b._id })
            return new BusinessDTO({ businessInfo: b, reviewInfo: reviewInfo })
        },),)
        // query categories
        var categoryResult = await this.categoryRepo.find({});
        // query top businesses by rating 
        var topBusinessesByRating = await this.businessRepo.getTopBusinessesByReview();

        // query services 
        var servicesResult = await this.serviceRepo.findandSort({}, { viewCount: -1 }, 10, 1, ["coupons", "serviceItems"])
        var trendingServiceResult = await Promise.all(servicesResult.map(async service => {
            var reviewInfo = await this.reviewService.getHighlevelReviewInfo({ service: service._id })
            const { coupons, serviceItems, ...rest } = service
            var activeCoupons = this.helper.filterActiveCoupons(coupons as Coupon[])
            var productsInsideService =  (serviceItems as ServiceItem[]).map(item => new ProductDTO({serviceItem : item})) 
            return new ServiceDTO({
                service: rest, coupons: activeCoupons,
                reviewInfo: reviewInfo,
                serviceItems: productsInsideService
            })
        }))

        var browseResult = new BrowseDTO({
            coupons: couponResult, featuredBusinesses: featuredBusinessDTO,
            categories: categoryResult, topBusinesses: topBusinessesByRating, featuredServices: trendingServiceResult
        })
        //Query products from coupons and services
        couponResult.forEach(coupon => {
            var serviceIds = coupon.services.map(service => service.service._id)
            services.push(...serviceIds)
        })
        if (services.length > 0) {
            var serviceItemResult = await this.serviceItemRepo.getServiceItems(services, { "featured": -1 })
            var productResults = serviceItemResult.map(item =>{
                const {business , ...rest} = item
                
                var isProductVerified = Helper.isBusinessVerfied(business as Business)
                return new ProductDTO({serviceItem : rest , businessInfo : business as Business , verified : isProductVerified})
                
            })
            browseResult.products = productResults
        }
        return browseResult
    }

    async getCategories() {
        var result = await this.categoryRepo.find({});
        return result;
    }

    async search(query: String , sortBy? : String): Promise<SearchDTO> {
        this.productSearchHandler.setNextHandler(this.serviceSearchHandler)
        this.serviceSearchHandler.setNextHandler(this.businessSearchHandler)
        var searchResult = await this.productSearchHandler.search(query.toString(), {} , sortBy , undefined , null)

        return searchResult
    }

    async getServiceProviderDashboard(user: User): Promise<DashBoardDTO> {
        var userBusinessResult = await this.businessRepo.find({ _id: { $in: user.userBusinesses } }, ["services", "coupons", "reviews"]);
        // Get business, service, coupon and review info
        var businessesDTOResult = userBusinessResult.map(business => {
            const { reviews, coupons, services, ...rest } = business
            var ratingInfo = this.helper.calculateRating(reviews as Review[])
            return new BusinessDTO({
                businessInfo: rest,
                reviewInfo: new ReviewDTO({ rating: ratingInfo.rating, reviews: reviews as Review[] }),
                services: services.map(service => new ServiceDTO({ service: service })),
                coupons: coupons.map(coupon => new CouponDTO({ couponInfo: coupon }))
            })
        })

        // get business order info
        var businessIds = userBusinessResult.map(business => business._id)
        var businessOrders = await this.orderService.getBusinessOrders(businessIds)
        return new DashBoardDTO({ businesses: businessesDTOResult, orders: businessOrders })
    }

    async createCategories(categories: Category[]) {
        var result = await this.categoryRepo.addMany(categories)

        if (result.acknowledged) {
            return true;
        }
        else return false;
    }

    async browseByCategory(categoryName: String): Promise<CategoryDTO> {
        var availableCoupons: Coupon[] = [];
        var businessesInfo: BusinessDTO[] = []

        var businessesbyCategory = await this.businessRepo.find({ category: categoryName.toLocaleUpperCase() }, ["coupons"])

        businessesInfo = await Promise.all(businessesbyCategory.map(async business => {
            const { coupons, ...rest } = business

            availableCoupons.push(...coupons as Coupon[])
            var businessReview = await this.reviewService.getHighlevelReviewInfo({ business: rest._id })

            return new BusinessDTO({ businessInfo: rest, reviewInfo: businessReview })
        }))
        var businessActiveCoupons = this.helper.filterActiveCoupons(availableCoupons)


        var browseResult = new CategoryDTO({ businesses: businessesInfo, coupons: businessActiveCoupons })
        console.log("browse result", browseResult)
        return browseResult;
    }


}
