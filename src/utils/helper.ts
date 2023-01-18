import { InternalServerErrorException } from "@nestjs/common";
import mongoose, { ClientSession, Connection, startSession } from "mongoose";

export class Helper {
    static async runInTransaction<R>(connection: Connection, operation: (sesstion: ClientSession) => Promise<R>) {
        var session = await connection.startSession();
        try {
            session.startTransaction({});
            var result = await operation(session)
            await session.commitTransaction()
            return result;

        } catch (ex) {
            console.log("transaction error" , ex.message)
            await session.abortTransaction()
            throw new InternalServerErrorException("" , "Transaction error occurred")
        } finally {
            await session.endSession()
        }
    }
}