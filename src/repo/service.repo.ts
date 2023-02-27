import { Inject, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { ReviewDTO } from "src/dto/review.dto"
import { ServiceDTO } from "src/dto/service.dto"
import { Coupon } from "src/model/coupon.model"
import { Review } from "src/model/review.model"
import { Service, ServiceDocument } from "src/model/service.model"
import { ServiceItem } from "src/model/service_item.model"
import { Helper, IHelper } from "src/utils/helper"
import { MongodbRepo } from "./mongodb.repo"
import { IRepository } from "./repo.interface"

export interface IServiceRepo extends IRepository<Service> {
    getServiceDTo(serviceId: String, loadFromDb?: Boolean): Promise<ServiceDTO>
    getRelatedServices(serviceInfo: Service): Promise<ServiceDTO[]>;
}

@Injectable()
export class ServiceRepository extends MongodbRepo<ServiceDocument> implements IServiceRepo {
    static injectName = "SERVICE_REPOSITORY"
    constructor(@InjectModel(Service.ModelName) protected serviceModel: Model<ServiceDocument>,
        @Inject(Helper.INJECT_NAME) private helper: IHelper) {
        super(serviceModel)
    }
    async getServiceDTo(serviceId: String): Promise<ServiceDTO> {
        var result: ServiceDTO;
        var serviceResult = await this.get(serviceId, ['serviceItems', "business"]) as Service
        result = new ServiceDTO({ service: serviceResult })
        return result;
    }
    async getRelatedServices(serviceInfo: Service): Promise<ServiceDTO[]> {
        var serviceResult = await this.find({ name: serviceInfo.name }, ['serviceItems', 'reviews', "business", "coupons"], 10) as Service[]
        var result = await serviceResult.filter(service => service._id.toString() != serviceInfo._id.toString()).map(service => {
            const { business, coupons, serviceItems, reviews, ...rest } = service
            var couponsDTO = this.helper.filterActiveCoupons(coupons as Coupon[])
            var servicePriceRange = this.helper.calculateServicePriceRange(serviceItems as ServiceItem[])
            var ratingInfo = this.helper.calculateRating(reviews as Review[])
            return new ServiceDTO({
                service: rest as Service, reviewInfo: new ReviewDTO({ rating: ratingInfo.rating, count: ratingInfo.count }),
                coupons: couponsDTO, priceRange: servicePriceRange
            })
        })
        return result;
    }
}