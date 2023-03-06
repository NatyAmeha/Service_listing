import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { ServiceItem, ServiceItemDocument } from "src/model/service_item.model"
import { MongodbRepo } from "./mongodb.repo"
import { IRepository } from "./repo.interface"

export interface IServiceItemRepo extends IRepository<ServiceItem> {
    getServiceItems(serviceId: String[], sortInfo?: any): Promise<ServiceItem[]>
    getBusinessTrendingProducts(businssId: String, sortObject: any): Promise<ServiceItem[]>
}

@Injectable()
export class ServiceItemRepository extends MongodbRepo<ServiceItemDocument> implements IServiceItemRepo {
    static injectName = "SERVICE_ITEM_REPOSITORY"
    constructor(@InjectModel(ServiceItem.ModelName) protected serviceItemModel: Model<ServiceItemDocument>) {
        super(serviceItemModel)
    }
    async getBusinessTrendingProducts(businssId: String, sortObject: any): Promise<ServiceItem[]> {
        var trendingProducts = await this.findandSort({ business: businssId }, sortObject, 8)
        return trendingProducts
    }
    async getServiceItems(serviceId: String[], sortInfo?: any): Promise<ServiceItem[]> {
        if (sortInfo) {
            var result = await this.findandSort({ service: { $in: serviceId } }, sortInfo!, null, null,
                [{
                    path: "business", model: "Business", select: { _id: 1, name: 1, subscription: 1 }
                }]) as ServiceItem[]

        }
        else {
            var result = await this.find({ service: { $in: serviceId } }, [
                {
                    path: "business", model: "Business", select: { _id: 1, name: 1, subscription: 1 }
                }
            ]) as ServiceItem[]
        }
        return result;
    }
}