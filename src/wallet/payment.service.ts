import { Transaction } from "src/model/transaction.model"

export interface IPayment {
    pay(amount: number, walletOwner?: String, transactionInfo?: Transaction): Promise<String>

    // payment method specific verifiaction
    // wallet transaction update verfication
    verifyPayment(transactionIdentifier : String): Promise<Boolean>
}