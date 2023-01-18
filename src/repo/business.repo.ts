import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { Business, BussinessDocument } from "src/model/business.model"
import { MongodbRepo } from "./mongodb.repo"
import { IRepository } from "./repo.interface"

export interface IBusinessRepo extends IRepository<Business>{}

@Injectable()
export class BusinessRepository extends MongodbRepo<BussinessDocument> implements IBusinessRepo{
    static  injectName = "BUSINESS_REPOSITORY"
    constructor(@InjectModel(Business.ModelName) protected userModel : Model<BussinessDocument>){
        super(userModel )
        
    }    

}