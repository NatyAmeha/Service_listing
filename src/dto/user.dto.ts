import { Business } from "src/model/business.model";
import { Order } from "src/model/order.model";
import { ServiceItem } from "src/model/service_item.model";
import { User } from "src/model/user.model";
import { BusinessDTO } from "./business.dto";
import { OrderDTO } from "./order.dto";
import { ProductDTO } from "./service_item.dto";

export class UserDTO{
    user? : User
    favoriteBusinesses? : BusinessDTO[]
    favoriteProducts? : ProductDTO[]
    orders? : OrderDTO[]
    walletBalance? : number
    constructor(data : Partial<UserDTO>){
        Object.assign(this, data);
    }
}