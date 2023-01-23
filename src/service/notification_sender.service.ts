export interface INotificationSender{
    sendNotification() : Promise<Boolean>
}

export class FirebaseNotificationSender implements INotificationSender{
    static INJECT_NAME = "NOTIFICATION_SENDER"
    sendNotification(): Promise<Boolean> {
        throw new Error("Method not implemented.");
    }

}