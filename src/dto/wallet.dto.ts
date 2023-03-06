import { Transaction } from "src/model/transaction.model";
import { WithdrawRequest } from "src/model/withdraw_request.mode";
import { TransactionDTO } from "./transaction.dto";

export class WalletDTO{
    balance? : number
    transactions? : TransactionDTO[]
    
    pendingCashoutRequest? : WithdrawRequest

    constructor(data : Partial<WalletDTO>){
        Object.assign(this, data);
    }
}