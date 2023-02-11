import { Inject, Injectable } from "@nestjs/common";
import { Notification } from "src/model/notification.model";
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

    async updateNotificationSeenStatus(notificationId : String) : Promise<boolean>{
        var notificationUpdateResult = await this.notificationRepo.updateWithFilter({_id : notificationId} , {seen : true})
        return notificationUpdateResult;
    }

    
}