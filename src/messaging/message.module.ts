import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, notificationSchema } from 'src/model/notification.model';
import { NotificationRepository } from 'src/repo/notification.repo';
import { FirebaseNotificationSender } from './firebase_notification';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: Notification.ModelName,
      schema: notificationSchema
    },],),
  ],
  controllers: [

    MessageController,
  ],
  providers: [
    {
      provide: FirebaseNotificationSender.INJECT_NAME,
      useClass: FirebaseNotificationSender,
    },
    {
      provide: NotificationRepository.injectName,
      useClass: NotificationRepository
    },
    MessageService, NotificationService,
  ],
  exports: [
    MessageService, NotificationService,
    FirebaseNotificationSender.INJECT_NAME,
    NotificationRepository.injectName,
  ]
})
export class MessageModule { }
