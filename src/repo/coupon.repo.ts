import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { Coupon, CouponDocument } from "src/model/coupon.model"
import { MongodbRepo } from "./mongodb.repo"
import { IRepository } from "./repo.interface"

export interface ICouponRepo extends IRepository<Coupon>{}


@Injectable()
export class CouponRepository extends MongodbRepo<CouponDocument> implements ICouponRepo{
    static  injectName = "COUPON_REPOSITORY"
    constructor(@InjectModel(Coupon.ModelName) protected couponModel : Model<CouponDocument>){
        super(couponModel)        
    }
}