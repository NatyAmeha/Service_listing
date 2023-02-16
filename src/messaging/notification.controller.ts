import { Controller, Get, Param, Put, Query } from "@nestjs/common";
import { UseGuards } from "@nestjs/common/decorators";
import { AuthGuard } from "@nestjs/passport";
import { GetUser } from "src/auth/get_user.decorator";
import { User } from "src/model/user.model";
import { MessageService } from "./message.service";
import { NotificationService } from "./notification.service";


@Controller('notification')
export class NotificationController {

    constructor(private messageService: MessageService , private notificationService : NotificationService) { }


    
} 