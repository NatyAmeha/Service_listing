import { Body, Controller, Get, Param, ParseBoolPipe, ParseIntPipe, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { AuthGuard } from '@nestjs/passport';
import { Response, response } from 'express';
import { result } from 'lodash';
import { Connection } from 'mongoose';
import { AuthNotRequired } from 'src/auth/auth.middleware';
import { GetUser } from 'src/auth/get_user.decorator';
import { Role, RoleGuard } from 'src/auth/role.guard';
import { BusinessCreateDTO, BusinessDTO } from 'src/dto/business.dto';
import { Business } from 'src/model/business.model';
import { User } from 'src/model/user.model';
import { ReviewService } from 'src/review/review.service';
import { AccountType, CouponType, NotificationType, ServiceItemType } from 'src/utils/constants';
import { Helper } from 'src/utils/helper';
import { BusinessService } from './business.service';
import { AuthService } from 'src/auth/auth.service';
import { NotificationService } from 'src/messaging/notification.service';
import { UserService } from 'src/user/user.service';
import { Notification } from 'src/model/notification.model';
import { MessageService } from 'src/messaging/message.service';
import { CouponService } from 'src/order/coupon.service';
import { Coupon } from 'src/model/coupon.model';
import { ServiceService } from 'src/service/service.service';
import { Service } from 'src/model/service.model';

@Controller('business')
export class BusinessController {

    constructor(
        private businesService: BusinessService,
        private authService: AuthService,
        private userService: UserService,
        private notificationService: NotificationService,
        private messagingService : MessageService,
        private couponService: CouponService,
        private serviceService : ServiceService,
        @InjectConnection() private connection: Connection
    ) {

    }

    @Post("/create")
    // @Role(AccountType.SERVICE_PROVIDER, AccountType.ADMIN)
    @UseGuards(AuthGuard())
    async createBusiness(@Body() businessInfo: BusinessCreateDTO, @GetUser() user: User, @Res() response : Response) {
        console.log("business info", businessInfo)
        var result = await Helper.runInTransaction<Business>(this.connection, async session => {
            var upgradeAccountResult = await this.authService.upgradeAccount(user, AccountType.SERVICE_PROVIDER, session)
            var businessResult = await this.businesService.createBusiness(businessInfo, user?._id, session)
            
            // if business = online_store create store service 
        //     if(businessInfo.business.type == "online_store"){
        //         var serviceInfo = new Service({
        //             name : `${businessInfo.business.name} Store`,
        //             contact : businessInfo.business.contact,
        //             addresses :  businessInfo.business.addresses,
        //             images : [businessInfo.business.images.shift()],
        //             business : businessInfo.business._id,
        //             type : ServiceItemType.PRODUCT,
        //             tags : ["Shopping"],
        //             businessName : businessInfo.business.name,
        //             description : "Buy products from our store, enjoy our deals and discount. ",
        //             creator : user._id,
        //             reviewPoints : ["devlivery"]

        //         })
        //         var serviceCreateResult = await this.serviceService.createService(serviceInfo , session)
        //     }

        //     console.log(businessResult._id  ,serviceCreateResult._id)
            
            
        //     // create coupon for new businesses
            
        //     var couponStartDate = new Date(Date.now())
        //     var couponEndDate = new Date(Date.now())
        //      couponEndDate.setMonth(couponEndDate.getMonth() +1);

        //     var couponInfo = new Coupon({name : `10% off from ${businessInfo.business.name}`,
        //     business : businessResult._id,
        //     businessName : businessResult.name,
        //     serviceName : serviceCreateResult.name,
        //     maxAmount : 50,
        //     couponType : CouponType.FIXED_AMOUNT,
        //     startDate : couponStartDate,
        //     endDate : couponEndDate,
            
        //     images : businessResult.images ,
        //     service : [serviceCreateResult._id],
        //     creator : user._id,
        //     description : "10% off for the first 50 customers buying our products and services"
        // })
        //     var couponCreateResult = await this.couponService.createCoupon(couponInfo);
            
            return businessResult
        })
        response.status(201).json(result)
        // send sms notification
        // this.messagingService.sendSmsMessage("New business has registered" , "+251915844494")

    }


    // Get requests ------------------------------------ -----------------------------------------

    @Get("/reviews")
    async getBusinessReviewInfo(@Query("id") business: String, @Query("star", ParseIntPipe) star?: number,
        @Query("page", ParseIntPipe) page?: number, @Query("size", ParseIntPipe) size?: number) {

        var reviewResult = await this.businesService.getBusinessReviewDetails(business, null, page, size, star)
        return reviewResult;
    }

    @Get("/:id")
    @UseGuards(AuthNotRequired)
    async getBusinessDetails(@Param("id") businessId: String, @Res() res : Response,  @GetUser() user?: User) {
        console.log("business id", businessId)
        var businessResult = await this.businesService.getBusinessDetails(businessId, user)
        res.status(200).json(businessResult)
       

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
    async editBusinessInfo(@Query("id") businessId: String, @Body() businessInfo: Business, @Res() response: Response) {
        var updateResult = await this.businesService.editBusiness(businessId, businessInfo)
        return response.status(200).json(updateResult)
    }

    @Put("/claim")
    @Role(AccountType.SERVICE_PROVIDER)
    @UseGuards(AuthGuard(), RoleGuard)
    async claimBusinessInfo(@Query("id") businessId: String,  @Res() response: Response) {
        var updateResult = await this.businesService.updateBusinessClaimStatus(businessId , true)
        return response.status(200).json(updateResult)
    }

    @Put("/verification")
    @Role(AccountType.ADMIN)
    @UseGuards(AuthGuard(), RoleGuard)
    async update(@Query("id") businessId: String, @Query("status", ParseBoolPipe) verificationStatus: boolean, @Res() response: Response) {
        var updateResult = await this.businesService.updateBusinessVerificationStatus(businessId, verificationStatus)
        response.status(200).json(updateResult)
        
        if (updateResult) {
            if (verificationStatus) {
                var businessInfo = await this.businesService.getBusinessWithLimitedInfo(businessId, "creator,images")
                var businessOwnerResult = await this.userService.getUserInfo(businessInfo.creator)
                var notificationInfo = new Notification({
                    title: "Your business has been approved",
                    description: `${businessInfo.name} has been approved. Now users can see and interact with your business.`,
                    business: businessId,
                    
                    notificationType: NotificationType.BUSINESS.toString(),
                    recepient: businessOwnerResult.user._id,
 
                })
                var businessImage = businessInfo.images[0]
                var notificationSendResult = await this.notificationService.sendNotification(notificationInfo, businessOwnerResult.user, businessImage)
            }
        } 

    }

    @Put("/like")
    @UseGuards(AuthGuard())
    async addBusinessToFavorite(@Res() response: Response, @GetUser() user: User, @Query("id") businessId: String) {
        var result = await Helper.runInTransaction(this.connection, async session => {
            var updateResult = await this.businesService.addToFavorite(businessId, user._id, session)
            return updateResult

        })
        return response.status(200).json(result);
    }

    @Put("/unlike")
    @UseGuards(AuthGuard())
    async removeBusinessFromFavorite(@Res() response: Response, @GetUser() user: User, @Query("id") businessId: String) {
        var result = await Helper.runInTransaction(this.connection, async session => {
            var updateResult = await this.businesService.removeFromFavorite(businessId, user._id, session)
            return updateResult

        })
        return response.status(200).json(result);
    }



}
