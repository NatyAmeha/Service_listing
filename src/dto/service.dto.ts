import { Service } from "src/model/service.model";
import { ServiceItem } from "src/model/service_item.model";
import { BusinessDTO } from "./business.dto";
import { CouponDTO } from "./coupon.dto";
import { ReviewDTO } from "./review.dto";
import { ProductDTO } from "./service_item.dto";

export class ServiceDTO{
    service? : Service
    serviceItems? : ProductDTO[]
    reviewInfo? : ReviewDTO
    relatedServices? : ServiceDTO[]
    business? : BusinessDTO
    coupons? : CouponDTO[]
    priceRange? : {min : number , max : number}
    verified? : boolean

    constructor(data : Partial<ServiceDTO>){
        Object.assign(this, data);
    }
}