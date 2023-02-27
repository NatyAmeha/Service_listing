export const COMMISSION_PERCENTAGE = 5 
export const AMOUNT_LEFT_AFTER_CASHOUT = 100
export const ELIGABLE_AMOUNT_FOR_CASH_OUT = 150
export const DEFAULT_DELIVERY_PRICE = 100


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

export enum SortOption{
    PRICE = "price" , LOCATION = "location", RATING = "rating"
}
export enum TransactionType{
    DEPOSIT = 0 , WITHDRAWAL = 1 , PURCHASE =2, 
     DISCOUNTCASHBACK = 3, CASHBACK = 4 , REWARD = 5
}
export enum TransactionStatus{
    APPROVED = 0 , PENDING = 1 , ERROR = 2
}
export enum WithdrawRequestStatus{
    PENDING , APPROVED
}


export enum SubscriptionPlanType {
    'MONTHLY' = "MONTHLY", 'ANNUAL' = "ANNUAL"  
}

export enum SubscriptionLevel{
    FREE , PREMIUM
}

export class Constants {
    static USER_MODEL = "User"
    static ORDER_MODEL = "Order"
}