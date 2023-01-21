import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { Business, businessSchema } from 'src/model/business.model';
import { BusinessRepository } from 'src/repo/business.repo';
import { ReviewRepository } from 'src/repo/review.repo';
import { ReviewModule } from 'src/review/review.module';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Business.ModelName, schema: businessSchema }]),
        AuthModule,
        ReviewModule
    ],
    providers: [
        {
            provide: BusinessRepository.injectName,
            useClass: BusinessRepository
        },
        
        BusinessService,

    ],
    controllers: [BusinessController],
    exports : [BusinessRepository.injectName]
})
export class BusinessModule { }
