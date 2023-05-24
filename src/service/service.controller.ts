import { Body, Controller, Post, Put, UseGuards, Query, Param, Get, SetMetadata, ParseIntPipe, ParseBoolPipe, Res, Inject } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { AuthGuard } from '@nestjs/passport';
import { Response, response } from 'express';
import { Connection } from 'mongoose';
import { AuthNotRequired } from 'src/auth/auth.middleware';
import { GetUser } from 'src/auth/get_user.decorator';
import { Role, RoleGuard } from 'src/auth/role.guard';
import { Review } from 'src/model/review.model';
import { Service } from 'src/model/service.model';
import { ServiceItem } from 'src/model/service_item.model';
import { User } from 'src/model/user.model';

import { ReviewService } from 'src/review/review.service';
import { AccountType, NotificationType } from 'src/utils/constants';
import { Helper } from 'src/utils/helper';
import { ServiceService } from './service.service';
import { NotificationService } from 'src/messaging/notification.service';
import { Notification } from 'src/model/notification.model';
import { UserService } from 'src/user/user.service';

@Controller('service')
export class ServiceController {
    constructor(private serviceService: ServiceService,
        private reviewService: ReviewService,
        private userService: UserService,

        private notificationService: NotificationService,
        @InjectConnection() private connection: Connection) {

    }

    @Get("/reviews")
    async getServiceReviewInfo(@Query("id") serviceId: String, @Query("star", ParseIntPipe) star?: number,
        @Query("page", ParseIntPipe) page: number = 1, @Query("size", ParseIntPipe) size: number = 20) {

        var reviewResult = await this.serviceService.getServiceReviews(serviceId, null, page, size, star)
        var serviceInfo = await this.serviceService.getSimpleServiceInfo(serviceId);

        reviewResult.serviceInfo = new Service({
            _id: serviceInfo._id,
            name: serviceInfo.name, business: serviceInfo.business, businessName: serviceInfo.businessName,
            reviewPoints: serviceInfo.reviewPoints, images: serviceInfo.images,

        });
        return reviewResult;
    }



    @Get("/product/:id")
    @UseGuards(AuthNotRequired)
    async getServiceItemDetails(@Param("id") itemId: String, @GetUser() user?: User) {

        var serviceItemResult = await this.serviceService.getServiceItemDetails(itemId, user)
        return serviceItemResult
    }

    @Get("/:id")
    async getServiceDetails(@Param("id") businessId: String) {
        var serviceResult = await this.serviceService.getServiceDetails(businessId)
        return serviceResult

    }

    @Get("/")
    async getServices(@Query("query") query?: String, @Query("page") page?: number, @Query("size") size?: number) {
        var servicesResult = await this.serviceService.getServices(query, page, size)
        return servicesResult
    }

    // POST request -------------------------------------------------------------------------

    @Post("/create")
    @Role(AccountType.SERVICE_PROVIDER)
    @UseGuards(AuthGuard(), RoleGuard)
    async createService(@Body() serviceInfo: Service, @GetUser() serviceCreator: User) {
        console.log("Service info", serviceInfo)
        const { _id, ...restServiceInfo } = serviceInfo
        var serviceResult = await Helper.runInTransaction(this.connection, async session => {
            serviceInfo.creator = serviceCreator._id;
            var result = await this.serviceService.createService(restServiceInfo, session)
            return result;
        })
        return serviceResult
    }

    @Post("/product/create")
    @Role(AccountType.SERVICE_PROVIDER)
    @UseGuards(AuthGuard(), RoleGuard)
    async addProductToService(@Body() productInfo: ServiceItem) {
        // console.log("Product info", productInfo.variants.map(e => 'separator  ' +e.images.toString()) ,  productInfo)

        var r = await Helper.runInTransaction(this.connection, async session => {
            var result = await this.serviceService.createServiceItem(productInfo, session)
            return result;
        })
        return r
    }


    @Post("/review/add")
    @UseGuards(AuthGuard())
    async createReview(@Res() response: Response, @Body() reviewInfo: Review, @GetUser() user: User) {
        const { dateCreated, _id, ...rest } = reviewInfo
        var result = await Helper.runInTransaction(this.connection, async session => {
            var reviewResult = await this.serviceService.createReview(rest, user, session)
            if (reviewResult)
                return true
            else return false
        })

        var serviceOwner = await this.userService.getServiceProviderUserInfo(reviewInfo.service)
        response.status(200).json(result)

        // send notification for service provider about the review
        var notificationInfo = new Notification({
            title: "Your service got new review",
            description: `Someone reviewed your service ${reviewInfo.serviceName}. Click here to see the review`,
            notificationType: NotificationType.REVIEW.toString(),
            recepient: serviceOwner._id,
            service: reviewInfo.service,
            serviceName: reviewInfo.serviceName,

        })
        var notificationImage = ""
        var notificationSendResult = await this.notificationService.sendNotification(notificationInfo, serviceOwner, notificationImage)
    }


    // PUT request ------------------ ----------------------------------------------------------------
    
    @Put("/edit")
    @Role(AccountType.SERVICE_PROVIDER)
    @UseGuards(AuthGuard(), RoleGuard)
    async editService(@Query("id") serviceId: String, @Body() serviceInfo: Service, @Res() response: Response) {

        console.log("Edit service info", serviceInfo, serviceInfo.contact.links)
        var r = await Helper.runInTransaction(this.connection, async session => {
            var result = await this.serviceService.editService(serviceId, serviceInfo, session)
            return result;
        })
        return response.status(200).json(r);
    }

    @Put("/product/edit")
    @Role(AccountType.SERVICE_PROVIDER)
    @UseGuards(AuthGuard(), RoleGuard)
    async editServiceItem(@Query("id") serviceITemId: String, @Body() serviceItemInfo: ServiceItem, @Res() response: Response) {
        var editResult = await Helper.runInTransaction(this.connection, async session => {
            var result = await this.serviceService.editServiceItem(serviceITemId, serviceItemInfo, session)
            return result;
        })
        response.status(200).json(editResult)
    }

    @Put("/status/update")
    @Role(AccountType.SERVICE_PROVIDER, AccountType.ADMIN)
    @UseGuards(AuthGuard(), RoleGuard)
    async updateServiceActiveStatus(@Query("id") serviceId: String, @Query("status", ParseBoolPipe) activeStatus: Boolean) {
        // update status
        var result = await this.serviceService.updateServiceStatus(serviceId, activeStatus)
        // update wallet
        // send notification
        return result;
    }

    @Put("review/update")
    @UseGuards(AuthGuard())
    async updateReview(@Query("id") reviewId: String, @Body() reviewInfo: Review, @GetUser() user: User, @Res() response: Response) {
        var result = await Helper.runInTransaction(this.connection, async session => {
            var reviewResult = await this.serviceService.updateReview(reviewId, reviewInfo, user._id, session)
            return reviewResult;
        })
        console.log("up result", result)
        return response.status(200).json(result)
    }

}
