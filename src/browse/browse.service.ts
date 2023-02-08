import { Inject, Injectable } from '@nestjs/common';
import { BrowseDTO } from 'src/dto/browse.dto';
import { BusinessDTO } from 'src/dto/business.dto';
import { CouponDTO } from 'src/dto/coupon.dto';
import { DashBoardDTO } from 'src/dto/dashboard.dto';
import { ReviewDTO } from 'src/dto/review.dto';
import { SearchDTO } from 'src/dto/search.dto';
import { ServiceDTO } from 'src/dto/service.dto';
import { Category } from 'src/model/category.model';
import { Coupon } from 'src/model/coupon.model';
import { Order } from 'src/model/order.model';
import { Review } from 'src/model/review.model';
import { User } from 'src/model/user.model';
import { OrderService } from 'src/order/order.service';
import { BusinessRepository, IBusinessRepo } from 'src/repo/business.repo';
import { CategoryRepository, ICategoryRepo } from 'src/repo/category.repo';
import { CouponRepository, ICouponRepo } from 'src/repo/coupon.repo';
import { IServiceRepo, ServiceRepository } from 'src/repo/service.repo';
import { IServiceItemRepo, ServiceItemRepository } from 'src/repo/service_item.repo';
import { BusinessSearchHandler, ISearchHandler, ProductSearchHandler, ServiceSearchHandler } from 'src/services/search.handler';
import { Helper, IHelper } from 'src/utils/helper';

@Injectable()
export class BrowseService {
    constructor(
        @Inject(CouponRepository.injectName) private couponRepo: ICouponRepo,
        @Inject(ServiceItemRepository.injectName) private serviceItemRepo: IServiceItemRepo,
        @Inject(BusinessRepository.injectName) private businessRepo: IBusinessRepo,
        @Inject(Helper.INJECT_NAME) private helper: IHelper,
        private orderService: OrderService,
        @Inject(ServiceSearchHandler.INJECT_NAME) private serviceSearchHandler: ISearchHandler,
        @Inject(BusinessSearchHandler.INJECT_NAME) private businessSearchHandler: ISearchHandler,
        @Inject(ProductSearchHandler.INJECT_NAME) private productSearchHandler: ISearchHandler,
        @Inject(CategoryRepository.injectName) private categoryRepo: ICategoryRepo
    ) { }

    async getBrowse(): Promise<BrowseDTO> {
        var currentDate = new Date(Date.now())
        var services: String[] = []
        var couponResult = await this.couponRepo.getActiveCoupons(currentDate, 1, 10)
        var result = new BrowseDTO({ coupons: couponResult })

        //get service ids
        couponResult.forEach(coupon => {
            var serviceIds = coupon.services.map(service => service.service._id)
            services.push(...serviceIds)
        })
        //query service items by service id
        if (services.length > 0) {
            var serviceItemResult = await this.serviceItemRepo.getServiceItems(services, { "featured": -1 })
            result.products = serviceItemResult

        }
        // query featured businesses
        var businessREsult = await this.businessRepo.find({ featured: true })
        var featuredBusinessDTO = businessREsult.map(b => new BusinessDTO({ businessInfo: b }))
        result.featuredBusinesses = featuredBusinessDTO
        return result
    }

    async getCategories(){
        var result = await this.categoryRepo.find({});
        return result;
    }

    async search(query: String): Promise<SearchDTO> {
        this.productSearchHandler.setNextHandler(this.serviceSearchHandler)
        this.serviceSearchHandler.setNextHandler(this.businessSearchHandler)
        var searchResult = await this.productSearchHandler.search(query.toString(), {}, undefined, null)

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


}
