import { Inject, Injectable } from '@nestjs/common';
import { Notification } from 'src/model/notification.model';
import { INotificationRepo, NotificationRepository } from 'src/repo/notification.repo';

@Injectable()
export class MessageService {

    constructor(@Inject(NotificationRepository.injectName) private notificationRepo: INotificationRepo) { }


    
}