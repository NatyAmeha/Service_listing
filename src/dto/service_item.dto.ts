import { Business } from "src/model/business.model";
import { Coupon } from "src/model/coupon.model";
import { Service } from "src/model/service.model";
import { ServiceItem } from "src/model/service_item.model";
import { CouponDTO } from "./coupon.dto";

export class ProductDTO{
    serviceItem? : ServiceItem
    serviceInfo? : Service
    businessInfo? : Business
    relatedServiceItems? : ServiceItem[]
    couponsInfo? : CouponDTO[]
    favorite? : boolean = false
    

    constructor(data : Partial<ProductDTO>){
        Object.assign(this, data);
    }
}