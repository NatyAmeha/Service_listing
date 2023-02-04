import { Service } from "src/model/service.model";
import { ServiceItem } from "src/model/service_item.model";
import { BusinessDTO } from "./business.dto";
import { CouponDTO } from "./coupon.dto";
import { ReviewDTO } from "./review.dto";

export class ServiceDTO{
    service? : Service
    serviceItems? : ServiceItem[]
    reviewInfo? : ReviewDTO
    relatedServices? : ServiceDTO[]
    business? : BusinessDTO
    coupons? : CouponDTO[]

    constructor(data : Partial<ServiceDTO>){
        Object.assign(this, data);
    }
}