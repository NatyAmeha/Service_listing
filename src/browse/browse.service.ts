import { Inject, Injectable } from '@nestjs/common';
import { BrowseDTO } from 'src/dto/browse.dto';
import { BusinessDTO } from 'src/dto/business.dto';
import { SearchDTO } from 'src/dto/search.dto';
import { BusinessRepository, IBusinessRepo } from 'src/repo/business.repo';
import { CouponRepository, ICouponRepo } from 'src/repo/coupon.repo';
import { IServiceRepo, ServiceRepository } from 'src/repo/service.repo';
import { IServiceItemRepo, ServiceItemRepository } from 'src/repo/service_item.repo';
import { BusinessSearchHandler, ISearchHandler, ProductSearchHandler, ServiceSearchHandler } from 'src/services/search.service';

@Injectable()
export class BrowseService  {
    constructor(
        @Inject(CouponRepository.injectName) private couponRepo: ICouponRepo,        
        @Inject(ServiceItemRepository.injectName) private serviceItemRepo: IServiceItemRepo,
        @Inject(BusinessRepository.injectName) private businessRepo: IBusinessRepo,

        @Inject(ServiceSearchHandler.INJECT_NAME) private serviceSearchHandler: ISearchHandler,
        @Inject(BusinessSearchHandler.INJECT_NAME) private businessSearchHandler: ISearchHandler,
        @Inject(ProductSearchHandler.INJECT_NAME) private productSearchHandler: ISearchHandler,
    ) { }

    async getBrowse(): Promise<BrowseDTO> {
        var currentDate = new Date(Date.now())
        var services: String[] = []
        var couponResult = await this.couponRepo.getActiveCoupons(currentDate, 1, 10)
        var result = new BrowseDTO({ coupons: couponResult })

        //get service ids
        couponResult.forEach(coupon => {
            var serviceIds = coupon.services.map(service => service._id)
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

    async search(query : String) : Promise<SearchDTO>{
         this.productSearchHandler.setNextHandler(this.serviceSearchHandler)
         this.serviceSearchHandler.setNextHandler(this.businessSearchHandler)
         var searchResult = await this.productSearchHandler.search(query.toString() , undefined , null)
         
         return searchResult
    }
}
  