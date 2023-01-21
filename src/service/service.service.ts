import { Inject, Injectable } from '@nestjs/common';
import { ClientSession } from 'mongoose';
import { ReviewDTO } from 'src/dto/review.dto';
import { ServiceDTO } from 'src/dto/service.dto';
import { ServiceItemDTO } from 'src/dto/service_item.dto';
import { Business } from 'src/model/business.model';
import { Review } from 'src/model/review.model';
import { Service } from 'src/model/service.model';
import { ServiceItem } from 'src/model/service_item.model';
import { BusinessRepository, IBusinessRepo } from 'src/repo/business.repo';
import { IReviewRepo, ReviewRepository } from 'src/repo/review.repo';
import { IServiceRepo, ServiceRepository } from 'src/repo/service.repo';
import { IServiceItemRepo, ServiceItemRepository } from 'src/repo/service_item.repo';
import { ReviewService } from 'src/review/review.service';
import { Helper, IHelper } from 'src/utils/helper';
import* as _ from "lodash"

@Injectable()
export class ServiceService {
    constructor(@Inject(ServiceRepository.injectName) private serviceRepo: IServiceRepo,
        @Inject(BusinessRepository.injectName) private businessRepo: IBusinessRepo,
        @Inject(ServiceItemRepository.injectName) private serviceItemRepo: IServiceItemRepo,
        @Inject(ReviewRepository.injectName) private reviewRepo: IReviewRepo,
        private reviewService : ReviewService,
        @Inject(Helper.INJECT_NAME) private helper : IHelper) {

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

    async createReview(reviewInfo: Review, session?: ClientSession): Promise<Review>{
        var reviewCreateResult = await this.reviewRepo.add(reviewInfo)
        var serviceUpdateResult = await this.serviceRepo.updateWithFilter({ _id: reviewInfo.service }, { $push: { reviews: reviewCreateResult._id } })
        var businessUpdateREsult = await this.businessRepo.updateWithFilter({ _id: reviewInfo.business }, { $push: { reviews: reviewCreateResult._id } })
        return reviewCreateResult
    }

    async getServiceReviews(serviceId: String, keyPoints?: String[]): Promise<ReviewDTO> {
        var serviceReviews = await this.reviewService.getHighlevelReviewInfo({service: serviceId } , keyPoints)
        // console.log("service reviews" , serviceReviews , serviceId)
        // var rating = this.helper.calculateRating(serviceReviews, keyPoints)
        // var reviewDTOResult = new ReviewDTO({ rating: rating, reviews: _.take(serviceReviews, 10) })
        return serviceReviews
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

        //update serviceview count
        var updateResult = await this.serviceRepo.updateWithFilter({_id : id} , {$inc : {viewCount : 1}})
        
        //get review info
        var reviewResult = await this.reviewService.getHighlevelReviewInfo({service : id})
        result.reviewInfo = reviewResult
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
