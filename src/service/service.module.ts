import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { BusinessModule } from 'src/business/business.module';
import { Service, serviceSchema } from 'src/model/service.model';
import { ServiceItem, serviceItemSchema } from 'src/model/service_item.model';
import { ServiceRepository } from 'src/repo/service.repo';
import { ServiceItemRepository } from 'src/repo/service_item.repo';
import { ReviewModule } from 'src/review/review.module';
import { UserModule } from 'src/user/user.module';
import { Helper } from 'src/utils/helper';
import { WalletModule } from 'src/wallet/wallet.module';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';
import { MessageModule } from 'src/messaging/message.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Service.ModelName, schema: serviceSchema },
      { name: ServiceItem.ModelName, schema: serviceItemSchema }
    ]),
    AuthModule,
    WalletModule,
    BusinessModule,
    ReviewModule,
    MessageModule,
    UserModule
  ],
  controllers: [ServiceController],
  providers: [
    {
      provide: ServiceRepository.injectName,
      useClass: ServiceRepository
    },
    {
      provide: ServiceItemRepository.injectName,
      useClass: ServiceItemRepository
    },
    {
      provide : Helper.INJECT_NAME,
      useClass : Helper
    },
    ServiceService
  ],
  exports: [
    
    ServiceRepository.injectName,
    ServiceItemRepository.injectName,
    Helper.INJECT_NAME
  ]
})
export class ServiceModule { }
