import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { AuthGuard } from '@nestjs/passport';
import { result } from 'lodash';
import { Connection } from 'mongoose';
import { GetUser } from 'src/auth/get_user.decorator';
import { Role, RoleGuard } from 'src/auth/role.guard';
import { Business } from 'src/model/business.model';
import { User } from 'src/model/user.model';
import { AccountType } from 'src/utils/constants';
import { Helper } from 'src/utils/helper';
import { BusinessService } from './business.service';

@Controller('business')
export class BusinessController {

    constructor(private businesService: BusinessService, @InjectConnection() private connection: Connection) {

    }

    @Post("/create")
    @Role(AccountType.SERVICE_PROVIDER)
    @UseGuards(AuthGuard(), RoleGuard)
    async createBusiness(@Body() businessInfo: Business, @GetUser() user?: User) {
        var result = await Helper.runInTransaction<Business>(this.connection, async session => {
            var businessResult = await this.businesService.createBusiness(businessInfo, user?._id, session)
            return businessResult
        })

        return result
    }

    @Get("/:id")
    async getBusinessDetails(@Param("id") businessId: String) {
        var businessResult = await this.businesService.getBusinessDetails(businessId)
        return businessResult
    }

    @Get("/")
    async getBusinesses(@Query("query") query?: String , @Query("page") page? : number , @Query("size") size? : number) {
        var businessResult = await this.businesService.getBusinesses(query , page , size)
        return businessResult
    }

    @Put("/edit")
    @Role(AccountType.SERVICE_PROVIDER)
    @UseGuards(AuthGuard() , RoleGuard)
    async editBusinessInfo(@Query("id") businessId : String ,  @Body() businessInfo : Business){
        var updateResult = await this.businesService.editBusiness(businessId , businessInfo)
        return updateResult
    }



}
