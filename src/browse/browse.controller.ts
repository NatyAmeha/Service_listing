import { Controller, Get } from '@nestjs/common';
import { BrowseService } from './browse.service';

@Controller('browse')
export class BrowseController {

    constructor(private browseService : BrowseService){}

    @Get("/")
    async getBrowseInfo(){
        var browseResult = await this.browseService.getBrowse()
        return browseResult
    }
}
