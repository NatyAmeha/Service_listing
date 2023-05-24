import { Body, Controller, Get, Post, Put, Req, UseGuards } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { Connection } from 'mongoose';
import { AuthDTO, AuthResultDTO } from 'src/dto/auth.dto';
import { Transaction } from 'src/model/transaction.model';
import { User } from 'src/model/user.model';
import { Wallet } from 'src/model/wallet.model';
import { AccountType } from 'src/utils/constants';
import { Helper } from 'src/utils/helper';
import { WalletService } from 'src/wallet/wallet.service';
import { AuthService } from './auth.service';
import { GetUser } from './get_user.decorator';

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService, private walletService: WalletService,
    @InjectConnection() private connection: Connection,) { }

  @Post("/admin/signin")
  async signupOrSigninAdminWithPhone(@Body() userinfo: AuthDTO) {
    var result = await this.authService.signupOrSigninWithPhone(userinfo, AccountType.ADMIN.toString());
    return result;
  }

  @Post("/provider/signin")
  async signupOrSigninSellerWithPhone(@Body() userinfo: AuthDTO) {
    var result = await this.authService.signupOrSigninWithPhone(userinfo, AccountType.SERVICE_PROVIDER.toString());
    return result;
  }

  @Post("/user/signin")
  async signupOrSigninUserWithPhone(@Body() userinfo: AuthDTO) {
    console.log(userinfo)
    var tokenResult = await Helper.runInTransaction(this.connection, async session => {
      var authResult = await this.authService.signupOrSigninWithPhone(userinfo, AccountType.USER.toString());
      if (authResult.isNewUser) {
        var walletInfo = new Wallet({
          owner: authResult.user._id,
          address: authResult.user.username?.split(" ")[0]
        })
        var trInfo = new Transaction({
          description: "50 Birr Sign up bonus",
          recepientName: authResult.user.username
        })
        var walletCreateResult = await this.walletService.createWallet(walletInfo, trInfo, session)
      }

      return authResult
    })
    return tokenResult;
  }



  @Get("/users")
  @UseGuards(AuthGuard())
  async getUser(@Req() req: Request) {

    var result = await this.authService.getUser();
    return result;
  }



}
