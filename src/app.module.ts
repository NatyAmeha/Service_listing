import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { configSchema } from './config.schema';
import { BusinessModule } from './business/business.module';
import { ServiceModule } from './service/service.module';
import { OrderModule } from './order/order.module';
import { Helper } from './utils/helper';
import { BrowseModule } from './browse/browse.module';
import { UserModule } from './user/user.module';
import { ReviewModule } from './review/review.module';

import { MessageModule } from './messaging/message.module';
import { WalletModule } from './wallet/wallet.module';
import { AdminModule } from './admin/admin.module';
import { MulterModule } from '@nestjs/platform-express/multer';
import { memoryStorage } from 'multer';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.stage.${process.env.STAGE}`],
    // validationSchema: configSchema, 
      isGlobal: true,
    }),
    
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<String>("DB_URL")
      })
    })
    , AuthModule, BusinessModule, ServiceModule, OrderModule, BrowseModule, UserModule, ReviewModule, MessageModule, WalletModule, AdminModule,],
  controllers: [AppController],
  providers: [
    {
      provide: Helper.INJECT_NAME,
      useClass: Helper
    },
    AppService
  ],
  exports: [Helper.INJECT_NAME]
})
export class AppModule { }
