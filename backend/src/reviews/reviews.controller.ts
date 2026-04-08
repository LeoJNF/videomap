import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('service/:serviceId')
  async getServiceReviews(@Param('serviceId') serviceId: string) {
    return this.reviewsService.getServiceReviews(serviceId);
  }

  @Get('service/:serviceId/stats')
  async getServiceRatingStats(@Param('serviceId') serviceId: string) {
    return this.reviewsService.getServiceRatingStats(serviceId);
  }

  @Get('service/:serviceId/my-review')
  @UseGuards(JwtAuthGuard)
  async getUserReview(@Request() req, @Param('serviceId') serviceId: string) {
    return this.reviewsService.getUserReview(req.user.id, serviceId);
  }

  @Get('provider/:providerId')
  async getProviderReviews(@Param('providerId') providerId: string) {
    return this.reviewsService.getProviderReviews(providerId);
  }

  @Get('provider/:providerId/stats')
  async getProviderRatingStats(@Param('providerId') providerId: string) {
    return this.reviewsService.getProviderRatingStats(providerId);
  }

  @Post('service/:serviceId')
  @UseGuards(JwtAuthGuard)
  async createReview(
    @Request() req,
    @Param('serviceId') serviceId: string,
    @Body() body: { rating: number; comment?: string }
  ) {
    const review = await this.reviewsService.createReview(
      req.user.id,
      serviceId,
      body.rating,
      body.comment
    );
    return { message: 'Avaliação criada com sucesso', review };
  }

  @Put(':reviewId')
  @UseGuards(JwtAuthGuard)
  async updateReview(
    @Request() req,
    @Param('reviewId') reviewId: string,
    @Body() body: { rating: number; comment?: string }
  ) {
    const review = await this.reviewsService.updateReview(
      reviewId,
      req.user.id,
      body.rating,
      body.comment
    );
    return { message: 'Avaliação atualizada com sucesso', review };
  }

  @Delete(':reviewId')
  @UseGuards(JwtAuthGuard)
  async deleteReview(@Request() req, @Param('reviewId') reviewId: string) {
    await this.reviewsService.deleteReview(reviewId, req.user.id);
    return { message: 'Avaliação removida com sucesso' };
  }
}
