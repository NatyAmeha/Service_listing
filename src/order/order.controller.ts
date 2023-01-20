import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { AuthGuard } from '@nestjs/passport';
import { Connection } from 'mongoose';
import { GetUser } from 'src/auth/get_user.decorator';
import { Role } from 'src/auth/role.guard';
import { Order } from 'src/model/order.model';
import { User } from 'src/model/user.model';
import { UserService } from 'src/user/user.service';
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
}
