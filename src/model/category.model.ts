import { HydratedDocument, Schema } from "mongoose"

export class Category{
    _id? : String
    name? : String
    subCategories? : String[]
    image? : String
    icon? : String

    static ModelName = "Category"

    constructor(data : Partial<Category>){
        Object.assign(this, data);
    }
}

export type CategoryDocument = HydratedDocument<Category>

export var categorySchema = new Schema<Category>({
   name : {type : String ,required : true , unique : true},
   subCategories : {type : [String]}, 
   image : {type : String}, 
   icon : {type : String}
})