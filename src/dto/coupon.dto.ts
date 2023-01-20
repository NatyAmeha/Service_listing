import { Business } from "src/model/business.model";
import { Coupon } from "src/model/coupon.model";
import { Service } from "src/model/service.model";
import { ServiceDTO } from "./service.dto";

export class CouponDTO {
    couponInfo: Coupon
    services?: Service[]
    business?: Business

    constructor(data: Partial<CouponDTO>) {
        Object.assign(this, data);
    }
} 