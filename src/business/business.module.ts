import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { Business, businessSchema } from 'src/model/business.model';
import { ServiceItem, serviceItemSchema } from 'src/model/service_item.model';
import { BusinessRepository } from 'src/repo/business.repo';
import { ReviewRepository } from 'src/repo/review.repo';
import { ServiceItemRepository } from 'src/repo/service_item.repo';
import { ReviewModule } from 'src/review/review.module';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Business.ModelName, schema: businessSchema },
            { name: ServiceItem.ModelName, schema: serviceItemSchema }
        ]),
        AuthModule,
        ReviewModule
    ],
    providers: [
        {
            provide: BusinessRepository.injectName,
            useClass: BusinessRepository
        },

        {
            provide: ServiceItemRepository.injectName,
            useClass: ServiceItemRepository
        },
        
        BusinessService,

    ],
    controllers: [BusinessController],
    exports : [BusinessRepository.injectName]
})
export class BusinessModule { }
