import { Inject, Injectable } from '@nestjs/common';
import { ClientSession } from 'mongoose';
import { Business } from 'src/model/business.model';
import { BusinessRepository, IBusinessRepo } from 'src/repo/business.repo';
import { UserRepository } from 'src/repo/user.repo';
import { Helper } from 'src/utils/helper';

@Injectable()
export class BusinessService {
    constructor(@Inject(BusinessRepository.injectName) private businessRepo: IBusinessRepo,
         @Inject(UserRepository.injectName) private userRepo : UserRepository) {

    }

    async createBusiness(BusinessInfo: Business , userId : String, session?: ClientSession) : Promise<Business> {
        if (session) {
            this.businessRepo.addSession(session)
            this.userRepo.addSession(session)
        }
        //save business info
        var businessResult = await this.businessRepo.add(BusinessInfo)

        // update user info
        
        var userUpdateREsult = await this.userRepo.update({_id : userId} , {$push : {userBusinesses : businessResult._id}})
        return businessResult
        
    }

}
