import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { AuthGuard } from '@nestjs/passport';
import { Connection } from 'mongoose';
import { GetUser } from 'src/auth/get_user.decorator';
import { Role, RoleGuard } from 'src/auth/role.guard';
import { OrderDTO, OrderStatusDTO } from 'src/dto/order.dto';
import { Order } from 'src/model/order.model';
import { User } from 'src/model/user.model';
import { UserService } from 'src/user/user.service';
import { AccountType, OrderStatus } from 'src/utils/constants';
import { Helper } from 'src/utils/helper';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
    constructor(private orderService : OrderService , private userService : UserService ,  @InjectConnection() private dbConnection : Connection){}


    @Post("/create")
    @UseGuards(AuthGuard())
    async placeOrder(@GetUser() user : User ,  @Body() orderInfo : Order){
        //create order
        var result = await Helper.runInTransaction(this.dbConnection , async session =>{
            var orderCreateResult = await this.orderService.makeOrder(orderInfo , session)
            // update user info
            var updateResult = await this.userService.addOrderToUser(user._id , orderCreateResult._id , session)
            console.log("update result" , updateResult)
            return orderCreateResult
        })
        return result 
    }  


    // GET requst ----------------------------------------------------------------

    @Get("user")
    @UseGuards(AuthGuard())
    async getUserOrders(@GetUser() user : User ){
        var result = await this.orderService.getUserOrders(user._id)
        return result
    }

    @Get("/business")
    @Role(AccountType.SERVICE_PROVIDER)
    @UseGuards(AuthGuard() , RoleGuard)
    async getBusinessOrder(@Query("id") businessId : String) : Promise<OrderDTO[]>{
        var result = await this.orderService.getBusinessOrders([businessId])
        return result
    }


    @Get("/:id") 
    @UseGuards(AuthGuard())
    async getOrderDetails(@GetUser() user : User ,  @Param("id") orderId : String){
        var result = await this.orderService.getOrderDetails(orderId)
        return result
    }


    // PUT request ---------------------------------------------------------------------------
    @Put("/updateStatus")
    async updateOrderStatus(@Query("id") orderId : String , @Body() orderStatusInfo : OrderStatusDTO){
        //manipulate data
        var updateResult = await this.orderService.updateOrderStatus(orderId , orderStatusInfo)
        //send notification 
        return updateResult
    }


    

   
}
