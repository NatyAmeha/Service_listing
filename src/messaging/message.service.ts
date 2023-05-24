
import { PublishCommand, PublishCommandInput, SNSClient, SetSMSAttributesCommand, SetSMSAttributesCommandInput } from '@aws-sdk/client-sns';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Notification } from 'src/model/notification.model';
import { INotificationRepo, NotificationRepository } from 'src/repo/notification.repo';

@Injectable()
export class MessageService {

    constructor(@Inject(NotificationRepository.injectName) private notificationRepo: INotificationRepo, private configService: ConfigService) { }


    async sendSmsMessage(message: string, phoneNumber: string) {
        var snsClient = new SNSClient({
            region: process.env.REGION,
            credentials: { accessKeyId: this.configService.get<String>("ACCESS_KEY_ID").toString(), secretAccessKey: this.configService.get<String>("SECRET_ACCESS_KEY").toString() }
        })

        var smsTypeParam: SetSMSAttributesCommandInput = {
            attributes: {
                DefaultSMSType: "Transactional"
            }
        }

        var param: PublishCommandInput = {
            Message: message,
            PhoneNumber: phoneNumber,
        }

        var command = new PublishCommand(param)
        try {
            var smstypeResult = await snsClient.send(new SetSMSAttributesCommand(smsTypeParam))
            var smsSendResult = await snsClient.send(command)
            return smsSendResult.MessageId
        }
        catch (error) {
            return Promise.reject(error)
        }
    }

}