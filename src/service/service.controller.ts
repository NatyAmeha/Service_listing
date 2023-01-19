import { Body, Controller, Post, Put, UseGuards, Query, Param, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { AuthGuard } from '@nestjs/passport';
import { Connection } from 'mongoose';
import { Role, RoleGuard } from 'src/auth/role.guard';
import { Service } from 'src/model/service.model';
import { ServiceItem } from 'src/model/service_item.model';
import { AccountType } from 'src/utils/constants';
import { Helper } from 'src/utils/helper';
import { ServiceService } from './service.service';

@Controller('service')
export class ServiceController {
    constructor(private serviceService: ServiceService, @InjectConnection() private connection: Connection) {

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
    async getServices(@Query("query") query?: String , @Query("page") page? : number , @Query("size") size? : number) {
        var servicesResult = await this.serviceService.getServices(query , page , size)
        return servicesResult
    }

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

    @Put("/item/edit")
    @Role(AccountType.SERVICE_PROVIDER)
    @UseGuards(AuthGuard(), RoleGuard)
    async editServiceItem(@Query("id") serviceITemId: String, @Body() serviceItemInfo: ServiceItem) {
        var r = await Helper.runInTransaction(this.connection, async session => {
            var result = await this.serviceService.editServiceItem(serviceITemId, serviceItemInfo, session)
            return result;
        })
        return r
    }

    

}
