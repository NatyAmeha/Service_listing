import { Injectable, InternalServerErrorException } from "@nestjs/common";
import mongoose, { ClientSession, Connection, startSession } from "mongoose";
import { CouponCode } from "src/model/coupon.model";
export interface IHelper {
    
    generateCouponCodes(amount: number);
}

@Injectable()
export class Helper implements IHelper {
    static  INJECT_NAME = "HELPER_INJECT"
    generateCouponCodes(amount: number) : CouponCode[] {
        var codesResult: String[] = []
        for (let index = 0; index < amount; index++) {
            var generatedCode = this.generateCode(6, codesResult)
            if (generatedCode) codesResult.push(generatedCode)
        }
        return  codesResult.map(code => new CouponCode({value : code , used : false }))
    }
    static async runInTransaction<R>(connection: Connection, operation: (sesstion: ClientSession) => Promise<R>) {
        var session = await connection.startSession();
        try {
            session.startTransaction({});
            var result = await operation(session)
            await session.commitTransaction()
            return result;

        } catch (ex) {
            console.log("transaction error", ex.message)
            // await session.abortTransaction()
            throw new InternalServerErrorException("", "Transaction error occurred")
        } finally {
            await session.endSession()
        }
    }

    generateCode(length: number, generatedCodes: String[]): String | undefined {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        if (generatedCodes.indexOf(text) == -1) {
            return text;
        }
        else {
            this.generateCode(length, generatedCodes);
        }
    }
}