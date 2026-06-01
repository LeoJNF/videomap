import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingController } from './billing.controller';
import { BillingPlan } from './billing-plan.entity';
import { BillingService } from './billing.service';
import { BillingSubscription } from './billing-subscription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BillingPlan, BillingSubscription])],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
