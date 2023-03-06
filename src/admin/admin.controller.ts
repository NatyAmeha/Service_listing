import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { Role } from 'src/auth/role.guard';
import { WithdrawRequest } from 'src/model/withdraw_request.mode';
import { AccountType } from 'src/utils/constants';
import { WalletService } from 'src/wallet/wallet.service';

@Controller('admin')
export class AdminController {

    constructor(private walletService : WalletService){}

    @Post("/request")
    @UseGuards(AuthGuard())
    async requestCashout(@Body() requestInfo :  WithdrawRequest , @Res() response : Response){
        var result = await this.walletService.requestCashout(requestInfo)
        if(result){
            response.status(201).json(true)
        }
        else{
            response.status(400).json(false)
        }
    }
}
