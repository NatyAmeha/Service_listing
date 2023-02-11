import { Inject, Injectable } from "@nestjs/common";
import { MessagingPayload } from "firebase-admin/lib/messaging/messaging-api";
import { Notification } from "src/model/notification.model";
import { User } from "src/model/user.model";
import { INotificationRepo, NotificationRepository } from "src/repo/notification.repo";
import { FirebaseNotificationSender } from "./firebase_notification";
import { IMessaging } from "./messaging.interface";

@Injectable()
export class NotificationService {
    constructor(@Inject(FirebaseNotificationSender.INJECT_NAME) private fcmSender: IMessaging,
        @Inject(NotificationRepository.injectName) private notificationRepo: INotificationRepo) {

    }

    async getUserNotifications(userId: String): Promise<Notification[]> {
        var notificationResult = await this.notificationRepo.find({ recepient: userId })
        return notificationResult;
    }

    async updateNotificationSeenStatus(notificationId: String): Promise<boolean> {
        var notificationUpdateResult = await this.notificationRepo.updateWithFilter({ _id: notificationId }, { seen: true })
        return notificationUpdateResult;
    }

    async sendNotification(notificationInfo: Notification, userInfo: User, image: String): Promise<boolean> {
        var notificationCreateResult = await this.notificationRepo.add(notificationInfo)
        var fcmMessagePayload: MessagingPayload = {
            data: {
                title: notificationInfo.title?.toString(),
                body: `${notificationInfo.description}`,
                imageUrl:  image?.toString(),
                type: notificationInfo.notificationType.toString()
            }
        }
        if (userInfo.fcmToken.length > 0) {
            try {

                var fcmResult = await this.fcmSender.send<MessagingPayload>(fcmMessagePayload, userInfo.fcmToken as string[])
                console.log("fcm send result" , fcmResult)
            }catch(ex){
                // skip any error related firebase notification in order not to block other operations and response
                console.log(ex)
                return true
            }
        }
        return true;
    }


}