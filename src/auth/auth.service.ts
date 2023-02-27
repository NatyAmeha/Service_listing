import { Inject, Injectable } from '@nestjs/common';
import { ClientSession } from 'mongoose';
import { AuthDTO, AuthResultDTO } from 'src/dto/auth.dto';
import { User } from 'src/model/user.model';
import { IUserRepo, UserRepository } from 'src/repo/user.repo';
import { IJwtService, JwtStrategyService } from 'src/services/jwt.service';
import { AccountType } from 'src/utils/constants';

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
        var authResult: AuthResultDTO
        if (!userREsult) {
            console.log("user created")
            userREsult = new User()
            userREsult.username = authInfo.username
            userREsult.phoneNumber = authInfo.phoneNumber
            userREsult.accountType = accountType
            userREsult.userBusinesses = []
            userREsult.favoriteProducts = []
            userREsult.favoriteBusinesses = []
            userREsult = await this.userRepo.add(userREsult);
            authResult.isNewUser = true
        }
        //send token
        var tokenREsult = await this.jwtStrategy.sign(userREsult)
        authResult.token = tokenREsult
        authResult.user = userREsult

        return authResult;

    }

    async getUser() {
        var result = await this.userRepo.getAll();
        return result;
    }
} 
