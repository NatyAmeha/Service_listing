import { Body, Controller, Post, Put, UseGuards, Query, Param, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { AuthGuard } from '@nestjs/passport';
import { Connection } from 'mongoose';
import { Role, RoleGuard } from 'src/auth/role.guard';
import { Review } from 'src/model/review.model';
import { Service } from 'src/model/service.model';
import { ServiceItem } from 'src/model/service_item.model';
import { ReviewService } from 'src/review/review.service';
import { AccountType } from 'src/utils/constants';
import { Helper } from 'src/utils/helper';
import { ServiceService } from './service.service';

@Controller('service')
export class ServiceController {
    constructor(private serviceService: ServiceService,
        private reviewService : ReviewService,
        @InjectConnection() private connection: Connection) {

    }

    @Get("/reviews")
    async getServiceReviewInfo(@Query("id") serviceId: String, @Query("key") key?: String) {
        var reviewResult = await this.serviceService.getServiceReviews(serviceId, key?.split(","))
        return reviewResult;
    }

    @Post("/review/add") 
    @UseGuards(AuthGuard())
    async createReview(@Body() reviewInfo: Review) {
        var result = await Helper.runInTransaction(this.connection, async session => {
            var reviewResult = await this.serviceService.createReview(reviewInfo)
            return reviewResult;
        })
        return result
    }

    @Get("item/:id")
    async getServiceItemDetails(@Param("id") itemId: String) {
        var serviceItemResult = await this.serviceService.getServiceItemDetails(itemId)
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

    // post requests

    @Post("/create")
    @Role(AccountType.SERVICE_PROVIDER)
    @UseGuards(AuthGuard(), RoleGuard)
    async create(@Body() serviceInfo: Service) {
        var serviceResult = await Helper.runInTransaction(this.connection, async session => {
            var result = await this.serviceService.createService(serviceInfo, session)
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
    

    //put requests

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

    @Put("review/update")
    @UseGuards(AuthGuard())
    async updateReview(@Query("id") reviewId: String, @Body() reviewInfo: Review) {
        var reviewResult = await this.reviewService.updateReview(reviewId, reviewInfo)
        return reviewResult;
    }



}
