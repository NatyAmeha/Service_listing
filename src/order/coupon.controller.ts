import { Get, Post } from "@nestjs/common";
import { Controller } from "@nestjs/common/decorators/core/controller.decorator";
import { UseGuards } from "@nestjs/common/decorators/core/use-guards.decorator";
import { Body, Query } from "@nestjs/common/decorators/http/route-params.decorator";
import { InjectConnection } from "@nestjs/mongoose";
import { AuthGuard } from "@nestjs/passport";
import { Connection } from "mongoose";
import { Role, RoleGuard } from "src/auth/role.guard";
import { Coupon } from "src/model/coupon.model";
import { AccountType } from "src/utils/constants";
import { Helper } from "src/utils/helper";
import { CouponService } from "./coupon.service";
import { OrderService } from "./order.service";

@Controller("coupon")
export class CouponController {
    constructor(
        private orderService: OrderService,
        private couponService : CouponService,
        @InjectConnection() private dbConnection: Connection,) { }


    @Post("/create")
    @Role(AccountType.SERVICE_PROVIDER, AccountType.ADMIN)
    @UseGuards(AuthGuard(), RoleGuard)
    async createCoupon(@Body() couponData: Coupon) {
        var result = await Helper.runInTransaction(this.dbConnection, async session => {
            return await this.orderService.createCoupon(couponData, session)
        })
        return result;
    }

    @Get("/")
    async getAvailableCoupons(@Query("page") page : number = 1 ) {
        var currentDate = new Date(Date.now())
        var result = await this.couponService.getActiveCoupons(currentDate , page)
        return result;
    }

    
}