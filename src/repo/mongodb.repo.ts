import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ClientSession, Document, InsertManyResult, Model } from "mongoose";
import { IRepository } from "./repo.interface";


export class MongodbRepo<T extends Document> implements IRepository<T>{
    constructor(private model: Model<T>, protected session?: ClientSession) {

    }

    addSession(sess: ClientSession) {
        this.session = sess
    }
    async getAll(pageNumber?: number, size?: number): Promise<T[]> {
        try {
            var result = await this.model.find({}).skip((pageNumber - 1) * size).limit(size).session(this.session || null) as T[]
            return result;
        } catch (ex) {
            console.log(ex)
            throw new InternalServerErrorException(null, ex.toString())
        }


    }
    async get(id: String, populate?: String, incexc?: String): Promise<T> {
        try {
            var result = await this.model.findById(id).populate(populate?.toString()).session(this.session || null) as T;
            if (!result) {
                throw new NotFoundException(null, "Not found by this id")
            }
            return result;
        } catch (ex) {
            console.log(ex)
            throw new InternalServerErrorException(null, ex.toString())
        }


    }
    async find(predicate: Object, populateString?: any, limit?: number, page?, incexc?: String): Promise<T[]> {
        try {
            var result = await this.model.find(predicate).skip((page - 1) * limit).limit(limit).session(this.session || null) as T[]
            return result;
        } catch (ex) {
            console.log(ex)
            throw new InternalServerErrorException(null, ex.toString())
        }
    }
    async findandSort(predicate: Object, sortPredicate: Object, limit: number, populateString?: any): Promise<T[]> {
        try {
            var result = await this.model.find(predicate).sort(sortPredicate as any).limit(limit).session(this.session || null) as T[]
            return result
        } catch (ex) {
            console.log(ex)
            throw new InternalServerErrorException(null, ex.toString())
        }
    }
    async findOne(predicate: Object, populateString?: String, incExc?: String): Promise<T> {
        try {
            var result = await this.model.findOne(predicate).populate(populateString?.toString()).session(this.session || null) as T
            if (!result) {
                throw new NotFoundException(null, "Not found ")
            }
            return result
        } catch (ex) {
            console.log(ex)
            throw new InternalServerErrorException(null, ex.toString())
        }
    }
    async add(data: any, upsert?: boolean): Promise<T> {
        try {
            var result = await new this.model(data).save({ session: this.session })
            return result;
        } catch (ex) {
            console.log(ex)
            throw new InternalServerErrorException(null, ex.toString())
        }

    }
    async addMany(data: any): Promise<any> {
        try {
            var result = await this.model.insertMany(data, { ordered: false, rawResult: true })
            if (!result.acknowledged) return Promise.reject(new Error(`multiple datas is not inserted ${result.acknowledged}`))
            return result
        } catch (ex) {
            console.log(ex)
            throw new InternalServerErrorException(null, ex.toString())
        }
    }
    
    async upsert(query: Object, data: any): Promise<any> {
        try {
            var findResult = await this.model.findOne(query)
            if (findResult) {
                var result = await this.model.findByIdAndUpdate(findResult._id, data)
                return result;
            }
            return await this.add(data)
        } catch (ex) {
            console.log(ex)
            throw new InternalServerErrorException(null, ex.toString())
        }
    }
    async update(predicate: Object, data: T): Promise<any> {
        try {
            var result = await this.model.updateOne(predicate, { $set: data }, { new: true }).session(this.session || null)
            if (result) {
                return result
            }
            return Promise.reject(new InternalServerErrorException("DB", "unable to update user date"))
        } catch (ex) {
            console.log(ex)
            throw new InternalServerErrorException(null, ex.toString())
        }
    }

    async updateMany(predicate: Object, data: any): Promise<any> {
        try {
            var result = await this.model.updateMany(predicate, data, { new: true }).session(this.session || null)
            if (result.acknowledged) {
                return result
            }
            return Promise.reject(new InternalServerErrorException("DB", "unable to update user date"))
        } catch (ex) {
            console.log(ex)
            throw new InternalServerErrorException(null, ex.toString())
        }


    }
    async deleteMany(predicate: Object): Promise<Boolean> {
        try {
            var result = await this.model.deleteMany(predicate).session(this.session || null)
            if (result.acknowledged) return true
            else return Promise.reject(false)
        } catch (ex) {
            console.log(ex)
            throw new InternalServerErrorException(null, ex.toString())
        }
    }
    async remove(predicate: Object): Promise<Boolean> {
        try {
            var result = await this.model.remove(predicate).session(this.session || null)
            if (result.ok == 1) return Promise.resolve(true)
            return Promise.reject(false)
        } catch (ex) {
            console.log(ex)
            throw new InternalServerErrorException(null, ex.toString())
        }
    }

}