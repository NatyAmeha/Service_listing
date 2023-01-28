import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { AuthGuard } from '@nestjs/passport';
import { result } from 'lodash';
import { Connection } from 'mongoose';
import { AuthNotRequired } from 'src/auth/auth.middleware';
import { GetUser } from 'src/auth/get_user.decorator';
import { Role, RoleGuard } from 'src/auth/role.guard';
import { Business } from 'src/model/business.model';
import { User } from 'src/model/user.model';
import { ReviewService } from 'src/review/review.service';
import { AccountType } from 'src/utils/constants';
import { Helper } from 'src/utils/helper';
import { BusinessService } from './business.service';

@Controller('business')
export class BusinessController {

    constructor(
        private businesService: BusinessService,
        @InjectConnection() private connection: Connection
    ) {

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


    // Get requests -----------------------------------------------------------------------------

    @Get("/reviews")
    async getBusinessReviewInfo(@Query("id") business: String, @Query("key") key?: String,
        @Query("page", ParseIntPipe) page: number = 1, @Query("size", ParseIntPipe) size: number = 20) {
        var reviewResult = await this.businesService.getBusinessReviewDetails(business, key?.split(","), page, size)
        return reviewResult;
    }

    @Get("/:id")
    @UseGuards(AuthNotRequired)
    async getBusinessDetails(@Param("id") businessId: String, @GetUser() user?: User) {
        console.log("business id" , businessId)
        var businessResult = await this.businesService.getBusinessDetails(businessId, user)
        return businessResult

    }

    @Get("/")
    async getBusinesses(@Query("query") query?: String, @Query("page") page?: number, @Query("size") size?: number) {
        var businessResult = await this.businesService.getBusinesses(query, page, size)
        return businessResult
    }


    // put requests ------------------------------------------------------------------------------------------

    @Put("/edit")
    @Role(AccountType.SERVICE_PROVIDER)
    @UseGuards(AuthGuard(), RoleGuard)
    async editBusinessInfo(@Query("id") businessId: String, @Body() businessInfo: Business) {
        var updateResult = await this.businesService.editBusiness(businessId, businessInfo)
        return updateResult
    }

    @Put("/like")
    @UseGuards(AuthGuard())
    async addBusinessToFavorite(@GetUser() user: User, @Query("id") businessId: String) {
        var result = await Helper.runInTransaction(this.connection, async session => {
            var updateResult = await this.businesService.addToFavorite(businessId, user._id, session)
            return updateResult

        })
        return result;
    }

    @Put("/unlike")
    @UseGuards(AuthGuard("pass"))
    async removeBusinessFromFavorite(@GetUser() user: User, @Query("id") businessId: String) {
        var result = await Helper.runInTransaction(this.connection, async session => {
            var updateResult = await this.businesService.removeFromFavorite(businessId, user._id, session)
            return updateResult

        })
        return result
    }



}
