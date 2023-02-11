import { Controller, Get, Param, Put, Query } from "@nestjs/common";
import { MessageService } from "./message.service";
import { NotificationService } from "./notification.service";


@Controller('notification')
export class NotificationController {

    constructor(private messageService: MessageService , private notificationService : NotificationService) { }


    @Get("/user")
    async getUserNotifications(@Query("user") userId: String) {
        var result = await this.notificationService.getUserNotifications(userId)
        return result
    }

    @Put("/:id/update")
    async updateNotificationSeenStatus(@Param("id") notificationId: String) {
        var result = await this.notificationService.updateNotificationSeenStatus(notificationId)
        return result
    }
}