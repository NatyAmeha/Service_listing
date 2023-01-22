import { Business } from "src/model/business.model";
import { Order, OrderItem } from "src/model/order.model";
import { ServiceItem } from "src/model/service_item.model";

export class OrderDTO{
    order : Order
    items : OrderItem[]
    business? : Business
    couponCodes? : String[]

    constructor(data : Partial<OrderDTO>){
        Object.assign(this, data);
    }
}

export class OrderStatusDTO{
    status : String
    finalPrice? : number
    constructor(data : Partial<OrderDTO>){
        Object.assign(this, data);
    }
}