import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Service } from '../services/service.entity';
import { Lead } from '../leads/lead.entity';
import { Review } from '../reviews/review.entity';
import { Favorite } from '../favorites/favorite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Service, Lead, Review, Favorite])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
