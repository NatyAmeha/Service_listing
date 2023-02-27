import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { MessageModule } from 'src/messaging/message.module';
import { Service, serviceSchema } from 'src/model/service.model';
import { ServiceItem, serviceItemSchema } from 'src/model/service_item.model';
import { ReviewRepository } from 'src/repo/review.repo';
import { ServiceRepository } from 'src/repo/service.repo';
import { UserRepository } from 'src/repo/user.repo';
import { ReviewModule } from 'src/review/review.module';
import { ServiceModule } from 'src/service/service.module';
import { Helper } from 'src/utils/helper';
import { WalletModule } from 'src/wallet/wallet.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    // perposly added for 
    MongooseModule.forFeature([
      { name: Service.ModelName, schema: serviceSchema },
      { name: ServiceItem.ModelName, schema: serviceItemSchema }
    ]),
    AuthModule,
    MessageModule,
    ReviewModule,
    WalletModule
    
    
  ],
  controllers: [UserController],
  providers: [
    {
      provide: UserRepository.injectName,
      useClass: UserRepository
    },
    {
      provide: ServiceRepository.injectName,
      useClass: ServiceRepository
    },
    {
      provide : Helper.INJECT_NAME,
      useClass : Helper
    },
    
    UserService],
  exports: [UserService, UserRepository.injectName , Helper.INJECT_NAME]
})
export class UserModule { }
