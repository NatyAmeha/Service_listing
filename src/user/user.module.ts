import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { MessageModule } from 'src/messaging/message.module';
import { Service, serviceSchema } from 'src/model/service.model';
import { ServiceItem, serviceItemSchema } from 'src/model/service_item.model';
import { ServiceRepository } from 'src/repo/service.repo';
import { UserRepository } from 'src/repo/user.repo';
import { ServiceModule } from 'src/service/service.module';
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
    UserModule,
    
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
    UserService],
  exports: [UserService, UserRepository.injectName]
})
export class UserModule { }
