import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { userSchema } from 'src/model/user.model';
import { UserRepository, IUserRepo } from 'src/repo/user.repo';
import { JwtStrategyService } from 'src/services/jwt.service';
import { Constants } from 'src/utils/constants';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RoleGuard } from './role.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({ secret: "SUPER_SECRET", signOptions: { expiresIn: 24*3600 } }),
    MongooseModule.forFeature([{ name: Constants.USER_MODEL, schema: userSchema }])],
  controllers: [AuthController],

  providers: [
    {
      provide: UserRepository.injectName,
      useClass: UserRepository
    },
    {
       provide : JwtStrategyService.JWT_STRATEGY_INJECT,
       useClass : JwtStrategyService
    },
    AuthService,RoleGuard
  ],
  exports : [PassportModule , JwtStrategyService.JWT_STRATEGY_INJECT , UserRepository.injectName , RoleGuard]
})
export class AuthModule { }
