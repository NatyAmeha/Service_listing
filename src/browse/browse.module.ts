import { Module } from '@nestjs/common';
import { BusinessModule } from 'src/business/business.module';
import { OrderModule } from 'src/order/order.module';
import { ServiceModule } from 'src/service/service.module';
import { BrowseController } from './browse.controller';
import { BrowseService } from './browse.service';

@Module({
  imports : [BusinessModule, ServiceModule , OrderModule],
  controllers: [BrowseController],
  providers: [BrowseService]
})
export class BrowseModule {}
