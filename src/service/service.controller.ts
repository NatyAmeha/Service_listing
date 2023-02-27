import { Body, Controller, Post, Put, UseGuards, Query, Param, Get, SetMetadata, ParseIntPipe, ParseBoolPipe, Res } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { Connection } from 'mongoose';
import { AuthNotRequired } from 'src/auth/auth.middleware';
import { GetUser } from 'src/auth/get_user.decorator';
import { Role, RoleGuard } from 'src/auth/role.guard';
import { Review } from 'src/model/review.model';
import { Service } from 'src/model/service.model';
import { ServiceItem } from 'src/model/service_item.model';
import { User } from 'src/model/user.model';
import { ReviewService } from 'src/review/review.service';
import { AccountType } from 'src/utils/constants';
import { Helper } from 'src/utils/helper';
import { ServiceService } from './service.service';

@Controller('service')
export class ServiceController {
    constructor(private serviceService: ServiceService,
        private reviewService: ReviewService,
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
        var serviceResult = await Helper.runInTransaction(this.connection, async session => {
            serviceInfo.creator = serviceCreator._id;
            var result = await this.serviceService.createService(serviceInfo
                , session)
            return result;
        })
        return serviceResult
    }

    @Post("/item/add")
    @Role(AccountType.SERVICE_PROVIDER)
    @UseGuards(AuthGuard(), RoleGuard)
    async addServiceItem(@Body() serviceItemInfo: ServiceItem) {
        var r = await Helper.runInTransaction(this.connection, async session => {
            var result = await this.serviceService.createServiceItem(serviceItemInfo, session)
            return result;
        })
        return r
    }

    @Post("/review/add")
    @UseGuards(AuthGuard())
    async createReview(@Res() response: Response, @Body() reviewInfo: Review, @GetUser() user: User) {
        const { dateCreated, _id, ...rest } = reviewInfo
        throw new Error("")


        
        var result = await Helper.runInTransaction(this.connection, async session => {
            var reviewResult = await this.serviceService.createReview(rest, user, session)
            if (reviewResult)
                return true
            else return false
        })
        return response.status(200).json(result)
    }


    // PUT request ----------------------------------------------------------------------------------

    @Put("/edit")
    @Role(AccountType.SERVICE_PROVIDER)
    @UseGuards(AuthGuard(), RoleGuard)
    async editService(@Query("id") serviceId: String, @Body() serviceInfo: Service) {
        var r = await Helper.runInTransaction(this.connection, async session => {
            var result = await this.serviceService.editService(serviceId, serviceInfo, session)
            return result;
        })
        return r
    }

    @Put("/product/edit")
    @Role(AccountType.SERVICE_PROVIDER)
    @UseGuards(AuthGuard(), RoleGuard)
    async editServiceItem(@Query("id") serviceITemId: String, @Body() serviceItemInfo: ServiceItem) {
        var r = await Helper.runInTransaction(this.connection, async session => {
            var result = await this.serviceService.editServiceItem(serviceITemId, serviceItemInfo, session)
            return result;
        })
        return r
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
    async updateReview(@Query("id") reviewId: String, @Body() reviewInfo: Review, @Res() response: Response) {
        var reviewResult = await this.reviewService.updateReview(reviewId, reviewInfo)
        return response.status(200).json(reviewResult)
    }

}
