import { Module } from '@nestjs/common';
import { BusinessModule } from 'src/business/business.module';
import { OrderModule } from 'src/order/order.module';
import { ServiceModule } from 'src/service/service.module';
import { BusinessSearchHandler, ProductSearchHandler, ServiceSearchHandler } from 'src/services/search.service';
import { BrowseController } from './browse.controller';
import { BrowseService } from './browse.service';

@Module({
  imports: [BusinessModule, ServiceModule, OrderModule],
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
    BrowseService,
  ]
})
export class BrowseModule { }
