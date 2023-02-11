import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Mongoose } from 'mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { BusinessModule } from 'src/business/business.module';
import { Category, categorySchema } from 'src/model/category.model';
import { OrderModule } from 'src/order/order.module';
import { CategoryRepository } from 'src/repo/category.repo';
import { ReviewModule } from 'src/review/review.module';
import { ServiceModule } from 'src/service/service.module';
import { BusinessSearchHandler, ProductSearchHandler, ServiceSearchHandler } from 'src/services/search.handler';
import { BrowseController } from './browse.controller';
import { BrowseService } from './browse.service';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: Category.ModelName, schema: categorySchema },
      ],
    ),
    BusinessModule, ServiceModule, OrderModule, AuthModule,  ReviewModule],
  controllers: [BrowseController],
  providers: [
    {
      provide: ServiceSearchHandler.INJECT_NAME,
      useClass: ServiceSearchHandler,
    },
    {
      provide: BusinessSearchHandler.INJECT_NAME,
      useClass: BusinessSearchHandler,
    },
    {
      provide: ProductSearchHandler.INJECT_NAME,
      useClass: ProductSearchHandler,
    },
    {
      provide: CategoryRepository.injectName,
      useClass: CategoryRepository
    },

    BrowseService,
  ]
})
export class BrowseModule { }
