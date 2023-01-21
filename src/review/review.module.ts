import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { BusinessModule } from 'src/business/business.module';
import { Review, reviewSchema } from 'src/model/review.model';
import { ReviewRepository } from 'src/repo/review.repo';
import { ServiceModule } from 'src/service/service.module';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Review.ModelName, schema: reviewSchema }
    ])
    
  ],
  controllers: [ReviewController],
  providers: [
    {
      provide: ReviewRepository.injectName,
      useClass: ReviewRepository
    },
    ReviewService
  ],
  exports : [ReviewService , ReviewRepository.injectName , MongooseModule]
})
export class ReviewModule { }
