import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientSession } from 'mongoose';
import { AuthDTO, AuthResultDTO } from 'src/dto/auth.dto';
import { User } from 'src/model/user.model';
import { IUserRepo, UserRepository } from 'src/repo/user.repo';
import { IJwtService, JwtStrategyService } from 'src/services/jwt.service';
import { AccountType } from 'src/utils/constants';
import { ErrorHandler } from 'src/utils/error.util';

@Injectable()
export class AuthService {
    constructor(@Inject(UserRepository.injectName) private userRepo: IUserRepo,
        @Inject(JwtStrategyService.JWT_STRATEGY_INJECT) private jwtStrategy: IJwtService,) { }

    async signupOrSigninWithPhone(authInfo: AuthDTO, accountType: String, session?: ClientSession) {
        if (session) {
            this.userRepo.addSession(session)

        }
        var userREsult: User

      

            userREsult = await this.userRepo.findOne({ phoneNumber: authInfo.phoneNumber, accountType: accountType });

        var isNewUser = false;
        if (!userREsult) {
            if(!authInfo.username){
                return Promise.reject(new BadRequestException("" , ErrorHandler.NO_ACCOUNT_FOUND))
            }

            userREsult = new User()
            userREsult.username = authInfo.username
            userREsult.phoneNumber = authInfo.phoneNumber
            userREsult.accountType = accountType
            userREsult.userBusinesses = []
            userREsult.favoriteProducts = []
            userREsult.favoriteBusinesses = []
            userREsult = await this.userRepo.add(userREsult);
            isNewUser = true;
        }
        //send token
        var tokenREsult = await this.jwtStrategy.sign(userREsult)
        var authResult: AuthResultDTO = {
            token: tokenREsult,
            isNewUser: isNewUser,
            user: userREsult
        }

        return authResult;

    }

    async getUser() {
        var result = await this.userRepo.getAll();
        return result;
    }

    async upgradeAccount(userInfo: User, type: AccountType, session?: ClientSession) {
        if (session) {
            this.userRepo.addSession(session)
        }
        if (userInfo.accountType.toString() != type.toString()) {
            var result = await this.userRepo.updateWithFilter({ _id: userInfo._id }, { accountType: type })
            return result;
        }
        return true;

    }
} 
