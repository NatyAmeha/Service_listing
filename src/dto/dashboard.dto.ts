import { BusinessDTO } from "./business.dto";
import { OrderDTO } from "./order.dto";
import { ReviewDTO } from "./review.dto";
import { ServiceDTO } from "./service.dto";

export class DashBoardDTO{
    orders : OrderDTO[]
    notifications? : Notification
    businesses? : BusinessDTO[]

    constructor(data: Partial<DashBoardDTO>) {
        Object.assign(this, data);
    }
}