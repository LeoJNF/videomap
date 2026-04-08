import { Controller, Get, Post, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('provider')
  @UseGuards(JwtAuthGuard)
  async getProviderAnalytics(
    @Request() req,
    @Query('days') days?: string,
  ) {
    const period = days ? parseInt(days) : 30;
    return this.analyticsService.getProviderAnalytics(req.user.id, period);
  }

  @Get('service/:serviceId')
  @UseGuards(JwtAuthGuard)
  async getServiceAnalytics(
    @Request() req,
    @Param('serviceId') serviceId: string,
    @Query('days') days?: string,
  ) {
    const period = days ? parseInt(days) : 30;
    return this.analyticsService.getServiceAnalytics(serviceId, req.user.id, period);
  }

  @Post('track/whatsapp/:serviceId')
  async trackWhatsappClick(@Param('serviceId') serviceId: string) {
    await this.analyticsService.trackWhatsappClick(serviceId);
    return { message: 'Click tracked' };
  }
}
