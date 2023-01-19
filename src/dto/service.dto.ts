import { Service } from "src/model/service.model";
import { ServiceItem } from "src/model/service_item.model";
import { ReviewDTO } from "./review.dto";

export class ServiceDTO{
    serviceInfo? : Service
    serviceItems? : ServiceItem[]
    reviewInfo? : ReviewDTO
    relatedServices? : ServiceDTO[]

    constructor(data : Partial<ServiceDTO>){
        Object.assign(this, data);
    }
}