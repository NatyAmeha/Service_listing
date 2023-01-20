import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { Order, OrderDocuent as OrderDocument } from "src/model/order.model"
import { MongodbRepo } from "./mongodb.repo"
import { IRepository } from "./repo.interface"

export interface IOrderRepo extends IRepository<Order>{}

@Injectable()
export class OrderRepository extends MongodbRepo<OrderDocument> implements IOrderRepo{
    static  injectName = "ORDER_REPOSITORY"
    constructor(@InjectModel(Order.ModelName) protected orderModel : Model<OrderDocument>){
        super(orderModel)        
    }
} 