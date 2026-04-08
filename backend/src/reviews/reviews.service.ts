import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { Service } from '../services/service.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
  ) {}

  async createReview(userId: string, serviceId: string, rating: number, comment?: string): Promise<Review> {
    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('A avaliação deve ser entre 1 e 5 estrelas');
    }

    // Check if service exists
    const service = await this.servicesRepository.findOne({ 
      where: { id: serviceId },
      relations: ['provider']
    });

    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }

    // Prevent provider from reviewing their own service
    if (service.providerId === userId) {
      throw new ForbiddenException('Você não pode avaliar seu próprio serviço');
    }

    // Check if user already reviewed this service
    const existingReview = await this.reviewsRepository.findOne({
      where: { userId, serviceId },
    });

    if (existingReview) {
      throw new BadRequestException('Você já avaliou este serviço. Use a edição para atualizar sua avaliação.');
    }

    const review = this.reviewsRepository.create({
      userId,
      serviceId,
      rating,
      comment,
    });

    return this.reviewsRepository.save(review);
  }

  async updateReview(reviewId: string, userId: string, rating: number, comment?: string): Promise<Review> {
    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('A avaliação deve ser entre 1 e 5 estrelas');
    }

    const review = await this.reviewsRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    // Check if user owns this review
    if (review.userId !== userId) {
      throw new ForbiddenException('Você não pode editar a avaliação de outro usuário');
    }

    review.rating = rating;
    review.comment = comment;

    return this.reviewsRepository.save(review);
  }

  async deleteReview(reviewId: string, userId: string): Promise<void> {
    const review = await this.reviewsRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    // Check if user owns this review
    if (review.userId !== userId) {
      throw new ForbiddenException('Você não pode deletar a avaliação de outro usuário');
    }

    await this.reviewsRepository.remove(review);
  }

  async getServiceReviews(serviceId: string): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { serviceId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getUserReview(userId: string, serviceId: string): Promise<Review | null> {
    return this.reviewsRepository.findOne({
      where: { userId, serviceId },
      relations: ['user'],
    });
  }

  async getServiceRatingStats(serviceId: string): Promise<{ average: number; count: number; distribution: { [key: number]: number } }> {
    const reviews = await this.reviewsRepository.find({
      where: { serviceId },
    });

    if (reviews.length === 0) {
      return {
        average: 0,
        count: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / reviews.length;

    const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      distribution[review.rating]++;
    });

    return {
      average: Math.round(average * 10) / 10, // Round to 1 decimal
      count: reviews.length,
      distribution,
    };
  }

  async getProviderReviews(providerId: string): Promise<Review[]> {
    // Get all services by provider
    const services = await this.servicesRepository.find({
      where: { providerId },
      select: ['id'],
    });

    if (services.length === 0) {
      return [];
    }

    const serviceIds = services.map(s => s.id);

    // Get all reviews for these services
    const reviews = await this.reviewsRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.service', 'service')
      .where('review.serviceId IN (:...serviceIds)', { serviceIds })
      .orderBy('review.createdAt', 'DESC')
      .getMany();

    return reviews;
  }

  async getProviderRatingStats(providerId: string): Promise<{ average: number; count: number }> {
    const reviews = await this.getProviderReviews(providerId);

    if (reviews.length === 0) {
      return { average: 0, count: 0 };
    }

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / reviews.length;

    return {
      average: Math.round(average * 10) / 10,
      count: reviews.length,
    };
  }
}
