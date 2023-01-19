import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { ServiceItem, ServiceItemDocument } from "src/model/service_item.model"
import { MongodbRepo } from "./mongodb.repo"
import { IRepository } from "./repo.interface"

export interface IServiceItemRepo extends IRepository<ServiceItem>{}

@Injectable()
export class ServiceItemRepository extends MongodbRepo<ServiceItemDocument> implements IServiceItemRepo{
    static  injectName = "SERVICE_ITEM_REPOSITORY"
    constructor(@InjectModel(ServiceItem.ModelName) protected serviceModel : Model<ServiceItemDocument>){
        super(serviceModel)        
    }
}