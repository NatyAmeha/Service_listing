import { Inject, Injectable } from '@nestjs/common';
import { ClientSession } from 'mongoose';
import { Notification } from 'src/model/notification.model';
import { INotificationRepo, NotificationRepository } from 'src/repo/notification.repo';
import { INotificationSender, FirebaseNotificationSender } from 'src/services/notification_sender.service';

@Injectable()
export class NotificationService {

    constructor( 
        @Inject(NotificationRepository.injectName) private notificationRepo: INotificationRepo,
        @Inject(FirebaseNotificationSender.INJECT_NAME) private notificationSender: INotificationSender
    ) { }

    async createAndSendNotification(notificationInfo: Notification, session: ClientSession) {
        this.notificationRepo.addSession(session)
        var createResult = await this.notificationRepo.add(notificationInfo)
        //send notification
        var sendResult = await this.notificationSender.sendNotification()
        return sendResult  
    }

    async updateNotificationStatus(notificationId: String, seen: Boolean) {
        var updateResult = this.notificationRepo.updateWithFilter({ _id: notificationId }, { seen: seen })
        return updateResult
    }

    async getUserNotification(userId: String, page: number = 1, limit: number = 50) {
        var result = await this.notificationRepo.find({ recepient: userId }, null, limit, page)
        return result
    }

}
