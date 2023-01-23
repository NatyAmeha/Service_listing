import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, notificationSchema } from 'src/model/notification.model';
import { NotificationRepository } from 'src/repo/notification.repo';
import { FirebaseNotificationSender } from 'src/service/notification_sender.service';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: Notification.ModelName, schema: notificationSchema }
      ]
    )
  ],
  providers: [
    {
      provide : NotificationRepository.injectName,
      useClass : NotificationRepository,
    },

    {
      provide : FirebaseNotificationSender.INJECT_NAME,
      useClass : FirebaseNotificationSender
    },
    NotificationService],
  controllers: [NotificationController],
  exports : [NotificationRepository.injectName, FirebaseNotificationSender.INJECT_NAME , NotificationService]
})
export class NotificationModule { }
