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
            var result = await this.model.find().skip((pageNumber - 1) * size)
                .limit(size).session(this.session || null).lean() as T[]
            return result;
        } catch (ex) {
            console.log("get all exeption", ex)
            throw new InternalServerErrorException(null, ex.toString())
        }
    }
    async get(id: String, populate?: any, incexc?: String): Promise<T> {
        try {
            var result = await this.model.findById(id).populate(populate)
                .session(this.session || null).lean() as T;
            if (!result) {
                throw new NotFoundException(null, "Not found by this id")
            }
            return result;
        } catch (ex) {
            console.log(ex)
            throw new InternalServerErrorException(null, ex.toString())
        }


    }
    async find(predicate: Object, populateString?: any, limit: number = 100, page: number = 1, incexc?: String): Promise<T[]> {
        try {
            var result = await this.model.find(predicate)
                .populate(populateString).skip((page - 1) * limit)
                .limit(limit).session(this.session || null).lean() as T[]
            return result;
        } catch (ex) {
            console.log(ex)
            throw new InternalServerErrorException(null, ex.toString())
        }
    }
    async findandSort(predicate: Object, sortPredicate: Object, limit: number=100 , page : number = 1, populateString?: any): Promise<T[]> {
        try {
            var result = await this.model.find(predicate).sort(sortPredicate as any)
                .limit(limit).session(this.session || null).lean() as T[]
            return result
        } catch (ex) {
            console.log(ex)
            throw new InternalServerErrorException(null, ex.toString())
        }
    }
    async findOne(predicate: Object, populateString?: String, incExc?: String): Promise<T> {
        try {
            var result = await this.model.findOne(predicate)
                .populate(populateString?.toString()).session(this.session || null).lean() as T

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
            var findResult = await this.model.findOne(query).lean()
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
    async update(predicate: Object, data: any): Promise<Boolean> {
        try {
            console.log("data is ", data)
            var result = await this.model.updateOne(predicate, { $set: data }, { new: true })
                .session(this.session || null).lean()
            if (result.acknowledged) {
                return true
            }
            return false
        } catch (ex) {
            console.log("update error", ex)
            throw new InternalServerErrorException(null, ex.toString())
        }
    }

    async updateWithFilter(predicate: Object, data: Object, strict: Boolean = false): Promise<Boolean> {
        try {
            var result = await this.model.updateOne(predicate, data)
            .session(this.session || null).lean()
            console.log("data is ", data, result)
            if (result.acknowledged) {
                return true
            }
            return strict ? Promise.reject(false) : false
        } catch (ex) {
            console.log("update error", ex)
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