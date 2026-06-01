import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ServicesModule } from './services/services.module';
import { FavoritesModule } from './favorites/favorites.module';
import { ReviewsModule } from './reviews/reviews.module';
import { LeadsModule } from './leads/leads.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DemoDataModule } from './dev/demo-data.module';
import { buildDatabaseConfig } from './config/database.config';
import { BillingModule } from './billing/billing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => buildDatabaseConfig(configService),
    }),

    AuthModule,
    UsersModule,
    ServicesModule,
    FavoritesModule,
    ReviewsModule,
    LeadsModule,
    AnalyticsModule,
    NotificationsModule,
    BillingModule,
    DemoDataModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
