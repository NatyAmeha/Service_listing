import { Controller, Get, Query } from '@nestjs/common';
import { UseGuards } from '@nestjs/common/decorators';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get_user.decorator';
import { Role, RoleGuard } from 'src/auth/role.guard';
import { SearchDTO } from 'src/dto/search.dto';
import { User } from 'src/model/user.model';
import { AccountType } from 'src/utils/constants';
import { BrowseService } from './browse.service';

@Controller('browse')
export class BrowseController {

    constructor(private browseService : BrowseService){}
 
    

    @Get("/search")
    async search(@Query("query") query : String): Promise<SearchDTO>{        
        var result = await this.browseService.search(query)
        console.log("serchdata " , result)
        return result;

    } 
      

    @Get("/dashboard")
    @Role(AccountType.SERVICE_PROVIDER) 
    @UseGuards(AuthGuard() , RoleGuard) 
    async getServiceProviderDashboard(@GetUser() user : User){
        console.log("User info" , user)
        var result = await this.browseService.getServiceProviderDashboard(user)
        return result
    }

    @Get("/")
    async getBrowseInfo(){
        var browseResult = await this.browseService.getBrowse()
        return browseResult
    }

}
