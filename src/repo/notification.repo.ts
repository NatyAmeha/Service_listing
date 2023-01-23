import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { Notification, NotificationDocument } from "src/model/notification.model"
import { MongodbRepo } from "./mongodb.repo"
import { IRepository } from "./repo.interface"

export interface INotificationRepo extends IRepository<Notification>{}

@Injectable()
export class NotificationRepository extends MongodbRepo<NotificationDocument> implements INotificationRepo{
    static  injectName = "NOTIFICATION_REPOSITORY"
    constructor(@InjectModel(Notification.ModelName) protected orderModel : Model<NotificationDocument>){
        super(orderModel)        
    }
}