import { Controller, Get, Query } from '@nestjs/common';
import { Body, Post, Res, SetMetadata, UseGuards } from '@nestjs/common/decorators';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { GetUser } from 'src/auth/get_user.decorator';
import { Role, RoleGuard } from 'src/auth/role.guard';
import { SearchDTO } from 'src/dto/search.dto';
import { Category } from 'src/model/category.model';
import { User } from 'src/model/user.model';
import { AccountType } from 'src/utils/constants';
import { BrowseService } from './browse.service';

@Controller('browse')
export class BrowseController {

    constructor(private browseService : BrowseService){}
 
    

    @Get("/search")
    async search(@Query("query") query : String ,  @Query("sort") sortBy? : String): Promise<SearchDTO>{        
        var result = await this.browseService.search(query , sortBy)
        return result;

    } 
      

    @Get("/dashboard")
    @Role(AccountType.SERVICE_PROVIDER) 
    @UseGuards(AuthGuard() , RoleGuard) 
    async getServiceProviderDashboard(@GetUser() user : User){
        
        var result = await this.browseService.getServiceProviderDashboard(user)
        return result
    }

    @Get("/categories")
    async getBrowseCategories(){
        var categoryResult = await this.browseService.getCategories();
        return categoryResult;
    }
    @Get("/category")
    async browseByCategoryName(@Query("name") categoryName : String){
        console.log("category name" , categoryName)
        var browseResult = await this.browseService.browseByCategory(categoryName)
        return browseResult
    }


    @Get("/")
    async getBrowseInfo(){
        var browseResult = await this.browseService.getBrowse()
        return browseResult
    }

    
    


    @Post("/category/create")
    @Role(AccountType.ADMIN)
    @UseGuards(AuthGuard() , RoleGuard)
    async createBrowseCategories(@Body() categoryList : Category[] , @Res() response : Response){
        var createResult  = await this.browseService.createCategories(categoryList);
        return response.status(201).json(createResult)
        
    }

}
