import { Business } from "src/model/business.model";
import { Coupon } from "src/model/coupon.model";
import { Service } from "src/model/service.model";
import { ServiceItem } from "src/model/service_item.model";
import { CouponDTO } from "./coupon.dto";
import { ServiceDTO } from "./service.dto";

export class ProductDTO{
    serviceItem? : ServiceItem
    serviceInfo? : ServiceDTO
    businessInfo? : Business
    relatedProducts? : ProductDTO[]
    couponsInfo? : CouponDTO[]
    favorite? : boolean = false
    serviceLevelDiscount? : number;
    verified? :  boolean
    priceRange? : {min : number , max : number}
    

    constructor(data : Partial<ProductDTO>){
        Object.assign(this, data);
    }
}