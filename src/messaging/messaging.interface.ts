export interface IMessaging {
    send<T>(data: T, token?: string[] | string, topic?: string, ttl?: number): Promise<boolean>
}

export interface INotification {
    subscribeToTopic(topic: string, token: string | string[] | (string | undefined)[]): Promise<boolean>
    unsubscribeFromTopic(topic: string, token: string | string[] | (string | undefined)[]): Promise<boolean>
}