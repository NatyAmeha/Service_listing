import { Business } from "src/model/business.model";
import { KeyReview } from "src/model/review.model";
import { ServiceItem } from "src/model/service_item.model";
import { CouponDTO } from "./coupon.dto";
import { ReviewDTO } from "./review.dto";
import { ServiceDTO } from "./service.dto";
import { ServiceItemDTO } from "./service_item.dto";

export class BusinessDTO{
    businessInfo? : Business
    services? : ServiceDTO[]
    reviewInfo? : ReviewDTO
    relatedBusinesses? : BusinessDTO[]
    trendingProducts? : ServiceItemDTO[]
    isInUserFavorite? : Boolean
    coupons? : CouponDTO[]
    constructor(data : Partial<BusinessDTO>){
        Object.assign(this, data);
    }
}