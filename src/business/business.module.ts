import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { Business, businessSchema } from 'src/model/business.model';
import { BusinessRepository } from 'src/repo/business.repo';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Business.ModelName, schema: businessSchema }]),
        AuthModule
    ],
    providers: [
        {
            provide: BusinessRepository.injectName,
            useClass: BusinessRepository
        },
        BusinessService,

    ],
    controllers: [BusinessController]
})
export class BusinessModule { }
