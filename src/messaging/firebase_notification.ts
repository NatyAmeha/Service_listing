import { IMessaging, INotification } from "./messaging.interface";
import * as firebaseAdmin from "firebase-admin"
import { MessagingPayload } from "firebase-admin/lib/messaging/messaging-api";
var firebaseServiceAccount = require("../../melegna-2f6fc-firebase-adminsdk-2y9pb-01a094a4d7.json")
import * as _ from "lodash"


export class FirebaseNotificationSender implements IMessaging, INotification {

    static INJECT_NAME = "FIREBASE_NOTIFICATION";

    constructor() {
        this.initFcm();
    }

    initFcm() {
        firebaseAdmin.initializeApp({
            credential: firebaseAdmin.credential.cert(firebaseServiceAccount),
            databaseURL: "https://melegna.firebaseio.com"
        });
    }

    async send<T>(data: T, token?: string | string[], topic?: string, ttl?: number): Promise<boolean> {
        try {
            var option: firebaseAdmin.messaging.MessagingOptions = {
                priority: "high",
                timeToLive: ttl || 2419200
            }

            if (topic) {
                var result = await firebaseAdmin.messaging().sendToTopic(topic, data as MessagingPayload, option)
                console.log("message id", result.messageId)
                return result.messageId != null ? true : false
            }
            else {
                // console.log(validTokens);
                var messageResult = await firebaseAdmin.messaging().sendToDevice(token, data as MessagingPayload, option)
                console.log("fcm message result", messageResult.successCount, messageResult.results[0].error);
                return messageResult.successCount > 0 ? true : false
            }

        } catch (ex) {
            console.log("fcm message error", ex)
            return Promise.resolve(false)
        }
    }

    async subscribeToTopic(topic: string, token: string | string[] | (string | undefined)[]): Promise<boolean> {
        var validTokens = _.filter(token, tok => ((tok != undefined) && (typeof tok === 'string'))) as string[]

        var result = await firebaseAdmin.messaging().subscribeToTopic(validTokens, topic)
        console.log('fcm result', result.successCount, result.failureCount, result.errors)
        if (result.successCount > 0) return true
        else {
            console.log("fcm error", result.errors)
            return false
        }
    }

    async unsubscribeFromTopic(topic: string, token: string | string[] | (string | undefined)[]): Promise<boolean> {
        var validTokens = _.filter(token, tok => ((tok != undefined) && (typeof tok === 'string'))) as string[]

        var result = await firebaseAdmin.messaging().unsubscribeFromTopic(validTokens, topic)
        if (result.successCount > 0) return true
        else {
            console.log("fcm error", result.errors)
            return false
        }
    }

}