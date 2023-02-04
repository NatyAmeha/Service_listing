import { Inject, UnauthorizedException } from "@nestjs/common";
import { Injectable } from "@nestjs/common/decorators/core/injectable.decorator";
import { JwtService } from "@nestjs/jwt";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { IJwtPayload } from "src/model/jwt_payload.model";

import { User } from "src/model/user.model";
import { IUserRepo, UserRepository } from "src/repo/user.repo";

export interface IJwtService {
    sign(userInfo: User): Promise<string>
    // decodeToken(userInfo : User) : String;
}

@Injectable()
export class JwtStrategyService extends PassportStrategy(Strategy) implements IJwtService {
    static  JWT_STRATEGY_INJECT = "JWT_STRATEGY_INJECT"
    constructor(protected jwtService: JwtService , @Inject(UserRepository.injectName) private userRepo : IUserRepo) {
        super({
           secretOrKey : "SUPER_SECRET",
           jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
        })
     }

    async sign(userInfo: User): Promise<string> {
        try {
            var payload: IJwtPayload = {
                id: userInfo._id.toString(),
                username: userInfo.username,
                accountType: userInfo.accountType

            }
            var token = await this.jwtService.signAsync(payload)
            
            return token 
        } catch (ex) {
            console.log(ex);
            return Promise.reject(ex);
        }

    }

    async validate(payload : IJwtPayload) : Promise<User>{
         var userResult = await this.userRepo.findOne({_id : payload.id})
         if(!userResult){
            throw new UnauthorizedException();
         }
         return userResult;
    }
}