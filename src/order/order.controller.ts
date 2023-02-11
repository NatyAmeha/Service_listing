import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { AuthGuard } from '@nestjs/passport';
import { Connection } from 'mongoose';
import { GetUser } from 'src/auth/get_user.decorator';
import { Role, RoleGuard } from 'src/auth/role.guard';
import { OrderDTO, OrderStatusDTO } from 'src/dto/order.dto';
import { NotificationService } from 'src/messaging/notification.service';
import { Order } from 'src/model/order.model';
import { User } from 'src/model/user.model';
import { UserService } from 'src/user/user.service';
import { AccountType, OrderStatus } from 'src/utils/constants';
import { Helper } from 'src/utils/helper';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
    constructor(private orderService: OrderService,
        private userService: UserService,
        private notificationService: NotificationService,
        @InjectConnection() private dbConnection: Connection,) { }


    @Post("/create")
    @UseGuards(AuthGuard())
    async placeOrder(@GetUser() user: User, @Body() orderInfo: Order) {
        //create order
        const { _id, ...rest } = orderInfo
        var result = await Helper.runInTransaction(this.dbConnection, async session => {
            var orderCreateResult = await this.orderService.makeOrder(rest, user, session)
            // update user info
            var updateResult = await this.userService.addOrderToUser(user._id, orderCreateResult._id, session)
            console.log("update result", orderCreateResult, updateResult)
            return orderCreateResult
        },)
        return result
    }


    // GET requst ----------------------------------------------------------------

    @Get("user")
    @UseGuards(AuthGuard())
    async getUserOrders(@GetUser() user: User) {
        var result = await this.orderService.getUserOrders(user)
        return result
    }

    @Get("/business")
    @Role(AccountType.SERVICE_PROVIDER)
    @UseGuards(AuthGuard(), RoleGuard)
    async getBusinessOrder(@Query("id") businessId: String): Promise<OrderDTO[]> {
        var result = await this.orderService.getBusinessOrders([businessId])
        return result
    }


    @Get("/:id")
    @UseGuards(AuthGuard())
    async getOrderDetails(@Param("id") orderId: String, @GetUser() user: User) {
        var result = await this.orderService.getOrderDetails(orderId, user)
        return result
    }


    // PUT request ---------------------------------------------------------------------------
    @Put("/updateStatus")
    @Role(AccountType.SERVICE_PROVIDER)
    async updateOrderStatus(@Query("code") orderCode: String, @Body() orderStatusInfo: OrderStatusDTO) {
        //update order  data
        var updateResult = await this.orderService.updateOrderStatus(orderCode, orderStatusInfo)
        // send notification 
        // update wallet info


        return updateResult
    }





}
