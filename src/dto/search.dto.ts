import { Business } from "src/model/business.model";
import { BusinessDTO } from "./business.dto";
import { CouponDTO } from "./coupon.dto";
import { ServiceDTO } from "./service.dto";
import { ProductDTO } from "./service_item.dto";

export class SearchDTO{
    businesses? : BusinessDTO[]
    services? : ServiceDTO[]
    products? : ProductDTO[]
    coupons? : CouponDTO[]
    exactBusinessSearch? : boolean
    exactServiceSearch? : boolean
    exactProductSearch? : boolean

    constructor(data : Partial<SearchDTO>){
        Object.assign(this, data);
    }


} 