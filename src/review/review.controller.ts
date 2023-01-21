import { Body, Controller, Get, Post, Put, Query, UseGuards } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { AuthGuard } from '@nestjs/passport';
import { Connection } from 'mongoose';
import { Review } from 'src/model/review.model';
import { Helper } from 'src/utils/helper';
import { ReviewService } from './review.service';

@Controller('review')
export class ReviewController {
    constructor(private reviewService: ReviewService, @InjectConnection() private dbConnection: Connection) {

    }
    

    

    
}
