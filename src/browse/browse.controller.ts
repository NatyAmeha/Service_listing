import { Controller, Get, Query } from '@nestjs/common';
import { SearchDTO } from 'src/dto/search.dto';
import { BrowseService } from './browse.service';

@Controller('browse')
export class BrowseController {

    constructor(private browseService : BrowseService){}

    

    @Get("/search")
    async search(@Query("query") query : String): Promise<SearchDTO>{        
        var result = await this.browseService.search(query)
        return result;
    }

    @Get("/")
    async getBrowseInfo(){
        var browseResult = await this.browseService.getBrowse()
        return browseResult
    }
}
