import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { resolve } from 'path';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const entities = [__dirname + '/**/*.entity{.ts,.js}'];
        const dbType = configService.get<string>('DB_TYPE', 'postgres');

        if (dbType === 'sqljs') {
          return {
            type: 'sqljs',
            location: resolve(
              process.cwd(),
              configService.get<string>('SQLJS_LOCATION', 'videomap-local.sqlite'),
            ),
            autoSave: true,
            entities,
            synchronize: true,
            logging: false,
          };
        }

        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: parseInt(configService.get<string>('DB_PORT', '5432'), 10),
          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          entities,
          synchronize: true,
          ssl: { rejectUnauthorized: false },
        };
      },
    }),

    AuthModule,
    UsersModule,
    ServicesModule,
    FavoritesModule,
    ReviewsModule,
    LeadsModule,
    AnalyticsModule,
    NotificationsModule,
    DemoDataModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
