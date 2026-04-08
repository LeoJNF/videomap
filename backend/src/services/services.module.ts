import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './service.entity';
import { User } from '../users/user.entity';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { CloudinaryService } from './cloudinary.service';

@Module({
  imports: [TypeOrmModule.forFeature([Service, User])],
  providers: [ServicesService, CloudinaryService],
  controllers: [ServicesController],
})
export class ServicesModule {}