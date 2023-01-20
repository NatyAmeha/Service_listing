import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { BusinessModule } from 'src/business/business.module';
import { Coupon, couponSchema } from 'src/model/coupon.model';
import { Order, orderSchema } from 'src/model/order.model';
import { CouponRepository } from 'src/repo/coupon.repo';
import { OrderRepository } from 'src/repo/order.repo';
import { ServiceModule } from 'src/service/service.module';
import { UserModule } from 'src/user/user.module';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
    imports: [
        AuthModule,
        BusinessModule,
        ServiceModule,
        UserModule,
        MongooseModule.forFeature(
            [
                { name: Order.ModelName, schema: orderSchema },
                { name: Coupon.ModelName, schema: couponSchema }
            ]
        )
    ],
    controllers: [OrderController, CouponController],
    providers: [
        {
            provide: OrderRepository.injectName,
            useClass: OrderRepository
        },
        {
            provide: CouponRepository.injectName,
            useClass: CouponRepository
        },
        OrderService,
        CouponService
    ],
    exports : [OrderRepository.injectName , CouponRepository.injectName] 
})
export class OrderModule { }
