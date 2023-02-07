
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Category, CategoryDocument } from "src/model/category.model";
import { MongodbRepo } from "./mongodb.repo";
import { IRepository } from "./repo.interface";

export interface ICategoryRepo extends IRepository<Category> { }

@Injectable()
export class CategoryRepository extends MongodbRepo<CategoryDocument> implements ICategoryRepo {
    static injectName = "CATEGORY_REPOSITORY"
    constructor(@InjectModel(Category.ModelName) protected categoryModel: Model<CategoryDocument>) {
        super(categoryModel)
    }
} 