import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ClientSession, Model } from "mongoose";
import { User, UserDocument, userSchema } from "src/model/user.model";
import { MongodbRepo } from "./mongodb.repo";
import { IRepository } from "./repo.interface";

export interface IUserRepo extends IRepository<User>{}

@Injectable()
export class UserRepository extends MongodbRepo<UserDocument> implements IUserRepo{
    static  injectName = "USER_REPOSITORY"
    constructor(@InjectModel("User") protected userModel : Model<UserDocument>){
        super(userModel )
        
    }
}