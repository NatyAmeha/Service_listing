import { Controller, Get, Param, ParseIntPipe, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get_user.decorator';
import { User } from 'src/model/user.model';
import { NotificationService } from 'src/notification/notification.service';
import { CSVQueryPipe } from 'src/utils/csv_query.pipe';
import { UserService } from './user.service';

@Controller('user')
export class UserController {

    constructor(private notificationService : NotificationService , private userService : UserService){}

    @Get("/notifications")
    @UseGuards(AuthGuard())
    async getUserNotifications(@GetUser() user : User ,  @Query("page") page? : number , @Query("limit" , ParseIntPipe) limit? : number){
        var result = await this.notificationService.getUserNotification(user._id , page, limit)
        return result
    }

    @Get("/notifications/:id/update")
    @UseGuards(AuthGuard())
    async updateNotificationSeenStatus(@Param("id") notificatioNId? : String){
        var result = await this.notificationService.updateNotificationStatus(notificatioNId , true)
        return result
    }

    // PUT request ------------------------------------------------------------

    @Put("/products/add")
    @UseGuards(AuthGuard())
    async addProductsToFavorite(@Query("id" , CSVQueryPipe) productIds : String[] , @GetUser() user : User){
        var result = await this.userService.addProductToFavorite(productIds , user._id)
         return result
    }

    @Put("/products/remove")
    @UseGuards(AuthGuard())
    async removeProductsToFavorite(@Query("id" , CSVQueryPipe) productIds : String[] , @GetUser() user : User){
         var result = await this.userService.removeProductFromFavorite(productIds , user._id)
         return result
    }
}
