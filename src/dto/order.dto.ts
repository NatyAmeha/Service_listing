import { Business } from "src/model/business.model";
import { Order, OrderItem } from "src/model/order.model";
import { Review } from "src/model/review.model";
import { ServiceItem } from "src/model/service_item.model";
import { Transaction } from "src/model/transaction.model";
import { ReviewDTO } from "./review.dto";
import { TransactionDTO } from "./transaction.dto";

export class OrderDTO{
    order : Order
    items : OrderItem[]
    reviews? : ReviewDTO[]
    businesses? : Business[]
    couponCodes? : String[]
    userServiceReviews? : Review[]
    transactions? : TransactionDTO[]

    constructor(data : Partial<OrderDTO>){
        Object.assign(this, data); 
    }
}

export class OrderStatusDTO{
    status : String
    price? : number
    constructor(data : Partial<OrderDTO>){
        Object.assign(this, data);
    }
}