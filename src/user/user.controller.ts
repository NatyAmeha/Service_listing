import { Controller, Get, Param, ParseIntPipe, Put, Query, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { GetUser } from 'src/auth/get_user.decorator';
import { NotificationService } from 'src/messaging/notification.service';
import { User } from 'src/model/user.model';
import { CSVQueryPipe } from 'src/utils/csv_query.pipe';
import { UserService } from './user.service';

@Controller('user')
export class UserController {

    constructor(private notificationService: NotificationService, private userService: UserService) { }

    // @Get("/notifications")
    // @UseGuards(AuthGuard())
    // async getUserNotifications(@GetUser() user: User, @Query("page") page?: number, @Query("limit", ParseIntPipe) limit?: number) {
    //     var result = await this.notificationService.getUserNotification(user._id, page, limit)
    //     return result
    // }

    @Get("/account")
    @UseGuards(AuthGuard())
    async getUserAccountInfo(@GetUser() user: User) {
        var result = await this.userService.getUserInfo(user._id)
        return result
    }

    @Get("/products/favorite")
    @UseGuards(AuthGuard())
    async getUserFavoriteProducts(@GetUser() user: User) {
        var result = await this.userService.getUserFavoriteProducts(user._id)
        return result
    }

    @Get("/businesses/favorite")
    @UseGuards(AuthGuard())
    async getUserFavoriteBusinesss(@GetUser() user: User) {
        var result = await this.userService.getUserFavoriteBusinesses(user._id)
        return result
    }

    @Get("/notifications/:id/update")
    @UseGuards(AuthGuard())
    async updateNotificationSeenStatus(@Param("id") notificatioNId?: String) {
        // var result = await this.notificationService.updateNotificationStatus(notificatioNId, true)
        // return result
    }

    // PUT request ------------------------------------------------------------

    @Put("/products/add")
    @UseGuards(AuthGuard())
    async addProductsToFavorite(@Res() response: Response, @Query("ids", CSVQueryPipe) productIds: String[], @GetUser() user: User) {
        var result = await this.userService.addProductToFavorite(productIds, user._id)
        console.log("product ids", productIds, result)
        return response.status(200).json(result)
    }

    @Put("/products/remove")
    @UseGuards(AuthGuard())
    async removeProductsToFavorite(@Res() response: Response, @Query("ids", CSVQueryPipe) productIds: String[], @GetUser() user: User) {
        var result = await this.userService.removeProductFromFavorite(productIds, user._id)
        return response.status(200).json(result)
    }


    @Put("/fcm/update")
    @UseGuards(AuthGuard())
    async addFcmToken(@Query("token") fcmToken: String, @Res() response: Response, @GetUser() userInfo: User) {
        var userFcmUpdateResult = await this.userService.updateFcmToken(fcmToken, userInfo._id)
        return response.status(200).json(userFcmUpdateResult)

    }


}
