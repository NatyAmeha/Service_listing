import { Business } from "src/model/business.model";
import { Service } from "src/model/service.model";
import { ServiceItem } from "src/model/service_item.model";

export class ServiceItemDTO{
    serviceItem? : ServiceItem
    serviceInfo? : Service
    businessInfo? : Business
    relatedServiceItems? : ServiceItem[]

    constructor(data : Partial<ServiceItemDTO>){
        Object.assign(this, data);
    }
}