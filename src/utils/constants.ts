export enum AccountType {
    USER = "USER",
    ADMIN = "ADMIN",
    SERVICE_PROVIDER = "SERVICE_PROVIDER"
}

export enum OrderStatus {
    PENDING = "PENDING", COMPLETED = "COMPLETED"
}

export enum OrderType {
    PURCHASE = "PURCHASE", BOOKING = "BOOKING"
}

export enum CouponType{
    FIXED_AMOUNT = "FIXED_AMOUNT", TIMELY="TIMELY"
}

export enum NotificationType{
    ORDER = "ORDER", BUSINESS = "BUSINESS", SERVICE = "SERVICE", REWARD = "REWARD" , COUPON = "COUPON"
}

export class Constants {
    static USER_MODEL = "User"
    static ORDER_MODEL = "Order"
}