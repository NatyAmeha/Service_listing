import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { ServiceDTO } from "src/dto/service.dto"
import { Service, ServiceDocument } from "src/model/service.model"
import { MongodbRepo } from "./mongodb.repo"
import { IRepository } from "./repo.interface"

export interface IServiceRepo extends IRepository<Service> {
    getServiceDTo(serviceId: String, loadFromDb?: Boolean): Promise<ServiceDTO>
    getRelatedServices(serviceInfo: Service): Promise<ServiceDTO[]>;
}

@Injectable()
export class ServiceRepository extends MongodbRepo<ServiceDocument> implements IServiceRepo {
    static injectName = "SERVICE_REPOSITORY"
    constructor(@InjectModel(Service.ModelName) protected serviceModel: Model<ServiceDocument>) {
        super(serviceModel)
    }
    async getServiceDTo(serviceId: String): Promise<ServiceDTO> {
        var result : ServiceDTO;
        var serviceResult = await this.get(serviceId , ['serviceItems', "business"]) as Service
            result = new ServiceDTO({service : serviceResult})
        return result;
    }
    async getRelatedServices(serviceInfo: Service): Promise<ServiceDTO[]> {
        var serviceResult = await this.find({ name: serviceInfo.name }, ['serviceItems', "business"], 10)
        var result = await serviceResult.map(  service =>  new ServiceDTO({service : service}))
        return result;
    }
}