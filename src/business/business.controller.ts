import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { AuthGuard } from '@nestjs/passport';
import { Connection } from 'mongoose';
import { GetUser } from 'src/auth/get_user.decorator';
import { Business } from 'src/model/business.model';
import { User } from 'src/model/user.model';
import { Helper } from 'src/utils/helper';
import { BusinessService } from './business.service';

@Controller('business')
export class BusinessController {
    
    constructor(private businesService : BusinessService , @InjectConnection() private connection : Connection){

    }

    @Post("/create")
    @UseGuards(AuthGuard())
    async createBusiness(@Body() businessInfo : Business , @GetUser() user? : User){
        
        var result = await Helper.runInTransaction<Business>(this.connection , async session =>{
         var businessResult = await this.businesService.createBusiness(businessInfo , user?._id , session)
         return businessResult
        })
        
        return result
    }
        
}
