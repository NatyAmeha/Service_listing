export class ErrorHandler implements Error{   
    
    static PHONE_NUMBER_NOT_UNIQUE_ERROR_MSG = "Phone number is not unique"
    static CASHOUT_REQUEST_ERROR_AMOUNT_MUST_BE_LEFT = "100 birr must be left on your wallet after cashout"
    static CASHOUT__REQUEST_AMOUNT_0_ERROR = "the withdrawal amount must be greater than 0"
    static CASHOUT__REQUEST_INSUFFIIENT_BALANCE = "You don't have enough balance to cashout"
    static CASHOUT_REQUEST_ELIGABLITY_ERROR = "You can withdraw money only if you have more than ETB 300 on your wallet"
    
    static CASHOUT_DUPLICATE_REQUEST_ERROR = "You can't request another cash out before the previous one is approved."

    static DISCOUNT_CODE_ALREADY_USED = "discount code already used"
    static NO_ACCOUNT_FOUND = "No account found, Register"

    
    constructor(public name: string , public message: string,
         public status? : number , public stack?: string){}


}