import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from '../favorites/favorite.entity';
import { Lead } from '../leads/lead.entity';
import { Review } from '../reviews/review.entity';
import { Service } from '../services/service.entity';
import { User } from '../users/user.entity';
import { DemoDataService } from './demo-data.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Service, Review, Favorite, Lead])],
  providers: [DemoDataService],
})
export class DemoDataModule {}
