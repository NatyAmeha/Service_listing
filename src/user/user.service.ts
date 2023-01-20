import { Inject, Injectable } from '@nestjs/common';
import { ClientSession } from 'mongoose';
import { IUserRepo, UserRepository } from 'src/repo/user.repo';

@Injectable()
export class UserService {
    constructor(@Inject(UserRepository.injectName) private userRepo : IUserRepo ){}

    async addOrderToUser(userId : String , orderId : String , session? : ClientSession) : Promise<Boolean>{
        if(session){
            this.userRepo.addSession(session)
        }
       var updateResult = await this.userRepo.updateWithFilter({_id : userId} , {$push : {orders : orderId}})
       return updateResult
    }
        
}
