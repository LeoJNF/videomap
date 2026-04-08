import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { ExpoPushService } from './expo-push.service';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [NotificationsController],
  providers: [ExpoPushService],
  exports: [ExpoPushService],
})
export class NotificationsModule {}
