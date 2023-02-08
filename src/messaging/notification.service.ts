import { Inject, Injectable } from "@nestjs/common";
import { INotificationRepo, NotificationRepository } from "src/repo/notification.repo";
import { FirebaseNotificationSender } from "./firebase_notification";
import { IMessaging } from "./messaging.interface";

@Injectable()
export class NotificationService {
    constructor(@Inject(FirebaseNotificationSender.INJECT_NAME) private fcmSender: IMessaging,
        @Inject(NotificationRepository.injectName) private notificationRepo: INotificationRepo) {

    }
}