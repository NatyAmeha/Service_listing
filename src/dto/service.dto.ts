import { Service } from "src/model/service.model";
import { ServiceItem } from "src/model/service_item.model";
import { CouponDTO } from "./coupon.dto";
import { ReviewDTO } from "./review.dto";

export class ServiceDTO{
    serviceInfo? : Service
    serviceItems? : ServiceItem[]
    reviewInfo? : ReviewDTO
    relatedServices? : ServiceDTO[]
    coupons? : CouponDTO[]

    constructor(data : Partial<ServiceDTO>){
        Object.assign(this, data);
    }
}