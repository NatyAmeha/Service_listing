import { Inject, Injectable } from '@nestjs/common';
import { BrowseDTO } from 'src/dto/browse.dto';
import { BusinessDTO } from 'src/dto/business.dto';
import { BusinessRepository, IBusinessRepo } from 'src/repo/business.repo';
import { CouponRepository, ICouponRepo } from 'src/repo/coupon.repo';
import { IServiceRepo, ServiceRepository } from 'src/repo/service.repo';
import { IServiceItemRepo, ServiceItemRepository } from 'src/repo/service_item.repo';

@Injectable()
export class BrowseService {
    constructor(

        @Inject(CouponRepository.injectName) private couponRepo: ICouponRepo,
        @Inject(ServiceRepository.injectName) private serviceRepo: IServiceRepo,
        @Inject(ServiceItemRepository.injectName) private serviceItemRepo: IServiceItemRepo,
        @Inject(BusinessRepository.injectName) private businessRepo: IBusinessRepo,
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
}
