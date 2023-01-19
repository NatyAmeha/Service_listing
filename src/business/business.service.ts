import { Inject, Injectable } from '@nestjs/common';
import { result } from 'lodash';
import { ClientSession } from 'mongoose';
import { BusinessDTO } from 'src/dto/business.dto';
import { ServiceDTO } from 'src/dto/service.dto';
import { Business } from 'src/model/business.model';
import { BusinessRepository, IBusinessRepo } from 'src/repo/business.repo';
import { UserRepository } from 'src/repo/user.repo';
import { Helper } from 'src/utils/helper';

@Injectable()
export class BusinessService {
    constructor(@Inject(BusinessRepository.injectName) private businessRepo: IBusinessRepo,
        @Inject(UserRepository.injectName) private userRepo: UserRepository) {

    }

    async createBusiness(BusinessInfo: Business, userId: String, session?: ClientSession): Promise<Business> {
        if (session) {
            this.businessRepo.addSession(session)
            this.userRepo.addSession(session)
        }
        //save business info
        var businessResult = await this.businessRepo.add(BusinessInfo)

        // update user info

        var userUpdateREsult = await this.userRepo.updateWithFilter({ _id: userId }, { $push: { userBusinesses: businessResult._id } })
        return businessResult

    }

    async getBusinesses(query?: String, pageIndex: number = 1, pageSize: number = 20): Promise<Business[]> {
        var businessResult: Business[] = []
        if (query) {
            businessResult = await this.businessRepo.find({ name: query }, pageIndex, pageSize)
        }
        else {
            businessResult = await this.businessRepo.getAll(pageIndex, pageSize)
        }
        return businessResult;
    }

    async editBusiness(businessId : String , newInfo : Business) : Promise<Boolean>{
        // update business info
        var updateResult = await this.businessRepo.update({_id : businessId} , newInfo)
        return updateResult
    }

    async getBusinessDetails(businessId : String) : Promise<BusinessDTO>{
        //get businessInfo
        var businessInfo = await this.businessRepo.get(businessId , "services")
        var services = businessInfo.services.map(service => new ServiceDTO({serviceInfo : service}))
        var relatedBusinesses = await this.businessRepo.getRelatedBusiness(businessInfo)
        var businessDTOResult = new BusinessDTO({businessInfo : businessInfo , relatedBusinesses : relatedBusinesses , services : services})
        
        // get review info
        return businessDTOResult;        
    }


}
