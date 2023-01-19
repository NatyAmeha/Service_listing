import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { BusinessModule } from 'src/business/business.module';
import { Service, serviceSchema } from 'src/model/service.model';
import { ServiceItem, serviceItemSchema } from 'src/model/service_item.model';
import { ServiceRepository } from 'src/repo/service.repo';
import { ServiceItemRepository } from 'src/repo/service_item.repo';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Service.ModelName, schema: serviceSchema },
      { name: ServiceItem.ModelName, schema: serviceItemSchema }
    ]),
    AuthModule,
    BusinessModule
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
    ServiceService
  ]
})
export class ServiceModule { }
