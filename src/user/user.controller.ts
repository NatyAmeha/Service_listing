import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { GetUser } from 'src/auth/get_user.decorator';
import { TransactionDTO } from 'src/dto/transaction.dto';
import { WalletDTO } from 'src/dto/wallet.dto';
import { NotificationService } from 'src/messaging/notification.service';
import { User } from 'src/model/user.model';
import { WithdrawRequest } from 'src/model/withdraw_request.mode';
import { ReviewService } from 'src/review/review.service';
import { WithdrawRequestStatus } from 'src/utils/constants';
import { CSVQueryPipe } from 'src/utils/csv_query.pipe';
import { WalletService } from 'src/wallet/wallet.service';
import { UserService } from './user.service';

@Controller('user')
export class UserController {

    constructor(private notificationService: NotificationService,
        private userService: UserService,
        private walletService: WalletService,
        private reviewService : ReviewService
    ) { }

    // @Get("/notifications")
    // @UseGuards(AuthGuard())
    // async getUserNotifications(@GetUser() user: User, @Query("page") page?: number, @Query("limit", ParseIntPipe) limit?: number) {
    //     var result = await this.notificationService.getUserNotification(user._id, page, limit)
    //     return result
    // }

    @Get("/account")
    @UseGuards(AuthGuard())
    async getUserAccountInfo(@GetUser() user: User) {
        var userResult = await this.userService.getUserInfo(user._id)
        var userWalletBalance = await this.walletService.getWalletBalance(user._id)
        userResult.walletBalance = userWalletBalance
        return userResult
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

    @Get("/notifications")
    @UseGuards(AuthGuard())
    async getUserNotifications(@GetUser() user: User) {
        var result = await this.notificationService.getUserNotifications(user._id)

        return result
    }

    @Get("/reviews")
    @UseGuards(AuthGuard())
    async getUserReviews(@GetUser() user: User) {
        var result = await this.userService.getUserReviews(user._id)

        return result
    }

    @Get("/wallet/transactions")
    @UseGuards(AuthGuard())
    async getUserTransactions(@GetUser() user: User) {
        var transactionResult = await this.walletService.getWalletTransaaction(user._id)
        var pendingCashoutReqeust = await this.walletService.getPendingCashoutRequest(user._id)
        var walletBalance = await this.walletService.getWalletBalance(user._id)
        
        var result = new WalletDTO({
            balance : walletBalance,
            transactions: transactionResult,
            pendingCashoutRequest: pendingCashoutReqeust
        })
        return result
    }

    @Get("/wallet/transaction/:id")
    @UseGuards(AuthGuard())
    async getTransactionDetail(@Param("id") transactionId: String, @GetUser() user: User) {
       
        var result = await this.walletService.getTransactionDetail(transactionId)
        if (result.service) {
            var serviceReview = await this.reviewService.getHighlevelReviewInfo({service : result.service.service._id})
            result.service = {...result.service , reviewInfo : serviceReview}
            
            var review = await this.userService.getUserReviewForService(user._id, result.service.service._id)
            result.review = review
        }
       
        return result;

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

    @Put("notification/update")
    async updateNotificationSeenStatus(@Query("id") notificationId: String, @Res() response: Response) {
        console.log("notifiction update")
        var result = await this.notificationService.updateNotificationSeenStatus(notificationId)
        return response.status(200).json(result)
    }


    @Put("/fcm/update")
    @UseGuards(AuthGuard())
    async addFcmToken(@Query("token") fcmToken: String, @Res() response: Response, @GetUser() userInfo: User) {
        var userFcmUpdateResult = await this.userService.updateFcmToken(fcmToken, userInfo._id)
        return response.status(200).json(userFcmUpdateResult)

    }


    /// post request  ---------------------------------------------------------
    @Post("/wallet/request_cashout")
    @UseGuards(AuthGuard())
    async requestCashout(@Body() requestInfo: WithdrawRequest, @GetUser() user: User, @Res() response: Response) {
        requestInfo.user = user._id
        requestInfo.status = WithdrawRequestStatus.PENDING
        var result = await this.walletService.requestCashout(requestInfo)
        console.log("result", result)
        if (result) {
            response.status(201).json(true)
        }
        else {
            response.status(400).json(false)
        }

    }


}
