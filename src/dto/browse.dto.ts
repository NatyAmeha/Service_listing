import { Service } from "src/model/service.model";
import { ServiceItem } from "src/model/service_item.model";
import { BusinessDTO } from "./business.dto";
import { CouponDTO } from "./coupon.dto";
import { ServiceDTO } from "./service.dto";

export class BrowseDTO{
    coupons: CouponDTO[]
    products : ServiceItem[]
    featuredServices : ServiceDTO[]
    featuredBusinesses : BusinessDTO[]

    constructor(data : Partial<BrowseDTO>){
        Object.assign(this, data);
    }
    
}