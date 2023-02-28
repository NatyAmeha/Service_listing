import { Transaction } from "src/model/transaction.model";
import { WithdrawRequest } from "src/model/withdraw_request.mode";

export class TransactionDTO{
    transactions? : Transaction[]
    pendingCashoutRequest? : WithdrawRequest

    constructor(data : Partial<TransactionDTO>){
        Object.assign(this, data);
    }
}