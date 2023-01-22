import { ExecutionContext, Inject, Injectable, NestMiddleware } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { AuthGuard } from "@nestjs/passport";
import { IUserRepo, UserRepository } from "src/repo/user.repo";

@Injectable()
export class AuthNotRequired extends AuthGuard("jwt"){
    constructor (private reflector: Reflector, @Inject(UserRepository.injectName) private userRepo : IUserRepo){
        super()
    }

    canActivate(context: ExecutionContext) {
       
        var request = context.switchToHttp().getRequest()
        
        // var isPublic = this.reflector.getAllAndOverride<Boolean>("AUTH_NOT_REQUIRED", [context.getClass(), context.getHandler()])
        // if(isPublic){
             
        //     console.log("Is public")
             
            
        // }
         return super.canActivate(context) 
        
    }

    handleRequest(err, user, info) {
        // You can throw an exception based on either "info" or "err" arguments
       
        if (err || !user) {
          console.log("error called")
          return null
        }
        return user;
      }

    

    

}