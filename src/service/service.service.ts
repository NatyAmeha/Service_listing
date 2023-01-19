import { Inject, Injectable } from '@nestjs/common';
import { ClientSession } from 'mongoose';
import { ServiceDTO } from 'src/dto/service.dto';
import { ServiceItemDTO } from 'src/dto/service_item.dto';
import { Business } from 'src/model/business.model';
import { Service } from 'src/model/service.model';
import { ServiceItem } from 'src/model/service_item.model';
import { BusinessRepository, IBusinessRepo } from 'src/repo/business.repo';
import { IServiceRepo, ServiceRepository } from 'src/repo/service.repo';
import { IServiceItemRepo, ServiceItemRepository } from 'src/repo/service_item.repo';

@Injectable()
export class ServiceService {
    constructor(@Inject(ServiceRepository.injectName) private serviceRepo: IServiceRepo,
        @Inject(BusinessRepository.injectName) private businessRepo: IBusinessRepo,
        @Inject(ServiceItemRepository.injectName) private serviceItemRepo: IServiceItemRepo) {

    }

    async createService(serviceInfo: Service, session?: ClientSession): Promise<Service> {
        // add trnasaction session
        if (session) {
            this.serviceRepo.addSession(session)
            this.businessRepo.addSession(session)
        }
        //create service
        var serviceResult = await this.serviceRepo.add(serviceInfo)
        // update business
        var updateBusinessResult = await this.businessRepo.updateWithFilter({ _id: serviceInfo.business }, { $push: { services: serviceResult._id } })
        return serviceResult
    }

    async createServiceItem(serviceItemInfo: ServiceItem, session?: ClientSession): Promise<ServiceItem> {
        if (session) {
            this.serviceRepo.addSession(session)
            this.serviceItemRepo.addSession(session)
        }
        //add service item
        var result = await this.serviceItemRepo.add(serviceItemInfo)
        // update service 
        var serviceUpdateResult = await this.serviceRepo.updateWithFilter({ _id: result.service }, { $push: { serviceItems: result._id } })
        return result
    }

    async editService(id: String, serviceInfo: Service, session?: ClientSession): Promise<Boolean> {
        if (session) {
            this.serviceItemRepo.addSession(session)
        }
        //add service item
        var updateResult = await this.serviceRepo.update({ _id: id }, serviceInfo)
        return updateResult
    }

    async editServiceItem(id: String, serviceItemInfo: ServiceItem, session?: ClientSession): Promise<Boolean> {
        if (session) {
            this.serviceItemRepo.addSession(session)
        }
        //add service item
        var updateResult = await this.serviceItemRepo.update({ _id: id }, serviceItemInfo)
        return updateResult
    }

    async getServiceDetails(id: String) : Promise<ServiceDTO>{
        var serviceInfo = await this.serviceRepo.get(id , ['serviceItems', "business"])
        //get related services
        var relatedService = await this.serviceRepo.getRelatedServices(serviceInfo)
        var result = new ServiceDTO({serviceInfo : serviceInfo , relatedServices : relatedService})
        //get review info
        return result;
        
    }

    async getServiceItemDetails(serviceItemId : String) : Promise<ServiceItemDTO>{
        var itemResult = await this.serviceItemRepo.get(serviceItemId , ["service" , "business"])
        var serviceInfo = itemResult.service as Service
        var businessINfo = itemResult.business as Business
        var result = new ServiceItemDTO({serviceItem : itemResult , serviceInfo : serviceInfo , businessInfo : businessINfo})
        return result;
    }

    async getServices(query?: String, pageIndex: number = 1, pageSize: number = 20): Promise<ServiceDTO[]> {
        var services: Service[] = []
        if (query) {
            services = await this.serviceRepo.find({ name: query }, ['serviceItems', "business"] ,  10)
        }
        else {            
            services = await this.serviceRepo.find({} , ['serviceItems', "business"] , 10)
        }
        var result = services.map(ser => new ServiceDTO({serviceInfo : ser}))
        return result;
    }

}
