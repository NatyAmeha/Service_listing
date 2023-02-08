import { Category } from "src/model/category.model";
import { BusinessDTO } from "./business.dto";
import { CouponDTO } from "./coupon.dto";

export class CategoryDTO {
    category?: Category
    businesses?: BusinessDTO[]
    coupons?: CouponDTO[]

    constructor(data: Partial<BusinessDTO>) {
        Object.assign(this, data);
    }
}