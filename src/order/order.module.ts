import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Messaging } from 'firebase-admin/lib/messaging/messaging';
import { AuthModule } from 'src/auth/auth.module';
import { BusinessModule } from 'src/business/business.module';
import { MessageModule } from 'src/messaging/message.module';
import { Coupon, couponSchema } from 'src/model/coupon.model';
import { Order, orderSchema } from 'src/model/order.model';
import { CouponRepository } from 'src/repo/coupon.repo';
import { OrderRepository } from 'src/repo/order.repo';
import { ReviewModule } from 'src/review/review.module';
import { ServiceModule } from 'src/service/service.module';
import { UserModule } from 'src/user/user.module';
import { WalletModule } from 'src/wallet/wallet.module';
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
        ReviewModule,
        MessageModule,
        WalletModule,
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
    exports : [OrderRepository.injectName , CouponRepository.injectName , OrderService , CouponService] 
})
export class OrderModule { }
