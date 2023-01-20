import { ClientSession, InsertManyResult } from "mongoose"

export interface IRepository<T> {
    getAll(pageNumber?: number, size?: number): Promise<T[]>
    get(id: String, populate?: any, incexc?: String): Promise<T | null>
    find(preicate: Object, populateString?: any, limit?: number, page? : number, incexc?: String): Promise<T[]>
    findandSort(predicate: Object, sortPredicate: Object, limit: number, populateString?: any): Promise<T[]>
    findOne(preicate: Object, populateString?: String, incExc?: String): Promise<T | null>

    add(data: any, upsert?: boolean): Promise<T>
    addMany(data: any): Promise<any>
    // addAll(date: any[]): Promise<InsertManyResult<T>>
    upsert(query: Object, data: any): Promise<T | any>
    update(predicate: Object, data: any): Promise<Boolean>
    updateWithFilter(predicate: Object, data: Object , strict? : Boolean): Promise<Boolean>
    // updateOne(predicate: Object, data: any): Promise<any>
    updateMany(predicate: Object, data: any): Promise<T>

    deleteMany(predicate: Object): Promise<Boolean>
    remove(predicate: Object): Promise<Boolean>

    addSession(sess : ClientSession)
}