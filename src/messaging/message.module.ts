import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, notificationSchema } from 'src/model/notification.model';
import { NotificationRepository } from 'src/repo/notification.repo';
import { FirebaseNotificationSender } from './firebase_notification';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: Notification.ModelName,
      schema: notificationSchema
    },],),
  ],
  controllers: [
    NotificationController,
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
    NotificationService
  ]
})
export class MessageModule { }
