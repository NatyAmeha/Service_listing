import { CanActivate, ExecutionContext, Injectable, SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { User } from "src/model/user.model";
import { AccountType } from "src/utils/constants";

export const Role = (...accountType: AccountType[]) => SetMetadata("roles", accountType)

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector) {
    }

    canActivate(context: ExecutionContext): boolean {
        var req = context.switchToHttp().getRequest()
        var user = req.user as User
        var requiredRole = this.reflector.getAllAndOverride<AccountType[]>("roles", [context.getClass(), context.getHandler()])
        
        if (!requiredRole) {
            return true;
        }
        return requiredRole.some(accounttype => accounttype.toString() == user.accountType)
    }
}