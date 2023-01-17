import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthDTO } from 'src/dto/auth.dto';
import { User } from 'src/model/user.model';
import { AccountType } from 'src/utils/constants';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

    constructor(private authService : AuthService){}

    @Post("/provider/signin")
    async signupOrSigninSellerWithPhone(@Body() userinfo : AuthDTO){
      var result = await this.authService.signupOrSigninWithPhone(userinfo , AccountType.SERVICE_PROVIDER.toString());
      return result;
    }

    @Post("/user/signin")
    async signupOrSigninUserWithPhone(@Body() userinfo : AuthDTO){
      var result = await this.authService.signupOrSigninWithPhone(userinfo , AccountType.USER.toString());
      return result;
    }

    @Get("/users")
    @UseGuards(AuthGuard())
    async getUser(@Req() req : Request){
       
        var result = await this.authService.getUser();
        return result;
    }
}
