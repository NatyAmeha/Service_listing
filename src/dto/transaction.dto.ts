import { Order } from "src/model/order.model";
import { Review } from "src/model/review.model";
import { Transaction } from "src/model/transaction.model";
import { OrderDTO } from "./order.dto";
import { ServiceDTO } from "./service.dto";
import { ProductDTO } from "./service_item.dto";

export class TransactionDTO{
    transaction? : Transaction
    service? : ServiceDTO
    product? : ProductDTO
    review? : Review
    orderInfo? : OrderDTO

    constructor(data : Partial<TransactionDTO>){
        Object.assign(this, data);
    }
}