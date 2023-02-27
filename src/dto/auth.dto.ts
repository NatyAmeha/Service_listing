import { User } from "src/model/user.model"

export class AuthDTO {
    phoneNumber: String
    username: String
    accoutnType: String
}

export interface AuthResultDTO {
    token: String
    user?: User,
    isNewUser?: boolean
}