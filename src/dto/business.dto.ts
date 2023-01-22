import { Business } from "src/model/business.model";
import { KeyReview } from "src/model/review.model";
import { ServiceItem } from "src/model/service_item.model";
import { ReviewDTO } from "./review.dto";
import { ServiceDTO } from "./service.dto";

export class BusinessDTO{
    businessInfo? : Business
    services? : ServiceDTO[]
    reviewInfo? : ReviewDTO
    relatedBusinesses? : Business[]
    trendingProducts? : ServiceItem[]
    isInUserFavorite? : Boolean
    constructor(data : Partial<BusinessDTO>){
        Object.assign(this, data);
    }
}