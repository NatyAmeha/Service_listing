import { Category } from "src/model/category.model";
import { Service } from "src/model/service.model";
import { ServiceItem } from "src/model/service_item.model";
import { BusinessDTO } from "./business.dto";
import { CouponDTO } from "./coupon.dto";
import { ServiceDTO } from "./service.dto";
import { ProductDTO } from "./service_item.dto";

export class BrowseDTO{
    coupons?: CouponDTO[]
    products? : ProductDTO[]
    categories? : Category[]
    featuredServices? : ServiceDTO[]
    featuredBusinesses : BusinessDTO[]
    topBusinesses? : BusinessDTO[]

    constructor(data : Partial<BrowseDTO>){
        Object.assign(this, data);
    }
    
}