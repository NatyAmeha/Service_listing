import { Post } from "@nestjs/common";
import { Controller } from "@nestjs/common/decorators/core/controller.decorator";
import { UseGuards } from "@nestjs/common/decorators/core/use-guards.decorator";
import { Body } from "@nestjs/common/decorators/http/route-params.decorator";
import { InjectConnection } from "@nestjs/mongoose";
import { AuthGuard } from "@nestjs/passport";
import { Connection } from "mongoose";
import { Role, RoleGuard } from "src/auth/role.guard";
import { Coupon } from "src/model/coupon.model";
import { AccountType } from "src/utils/constants";
import { Helper } from "src/utils/helper";
import { OrderService } from "./order.service";

@Controller("coupon")
export class CouponController {
    constructor(private orderService: OrderService, @InjectConnection() private dbConnection: Connection) { }


    @Post("/create")
    @Role(AccountType.SERVICE_PROVIDER, AccountType.ADMIN)
    @UseGuards(AuthGuard(), RoleGuard)
    async createCoupon(@Body() couponData: Coupon) {
        var result = await Helper.runInTransaction(this.dbConnection, async session => {
            return await this.orderService.createCoupon(couponData, session)
        })
        return result;
    }
}