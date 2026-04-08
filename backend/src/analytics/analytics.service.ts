import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Service } from '../services/service.entity';
import { Lead } from '../leads/lead.entity';
import { Review } from '../reviews/review.entity';
import { Favorite } from '../favorites/favorite.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
    @InjectRepository(Lead)
    private leadsRepository: Repository<Lead>,
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(Favorite)
    private favoritesRepository: Repository<Favorite>,
  ) {}

  async getProviderAnalytics(providerId: string, days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Services do provider
    const services = await this.servicesRepository.find({
      where: { providerId },
    });

    // Total views
    const totalViews = services.reduce((sum, service) => sum + service.views, 0);
    
    // Total WhatsApp clicks
    const totalWhatsappClicks = services.reduce((sum, service) => sum + service.whatsappClicks, 0);

    // Conversion rate (WhatsApp clicks / Views)
    const conversionRate = totalViews > 0 ? (totalWhatsappClicks / totalViews) * 100 : 0;

    // Leads
    const leads = await this.leadsRepository.find({
      where: { 
        providerId,
        createdAt: Between(startDate, new Date()),
      },
    });

    const leadsStats = {
      total: leads.length,
      pending: leads.filter(l => l.status === 'pending').length,
      accepted: leads.filter(l => l.status === 'accepted').length,
      completed: leads.filter(l => l.status === 'completed').length,
      totalBudget: leads.reduce((sum, l) => sum + (Number(l.budget) || 0), 0),
    };

    // Reviews
    const reviews = await this.reviewsRepository.find({
      where: { 
        service: { providerId },
        createdAt: Between(startDate, new Date()),
      },
    });

    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0;

    // Favorites
    const favorites = await this.favoritesRepository.count({
      where: {
        service: { providerId },
      },
    });

    // Top performing services
    const topServices = [...services]
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map(s => ({
        id: s.id,
        title: s.title,
        views: s.views,
        whatsappClicks: s.whatsappClicks,
        conversionRate: s.views > 0 ? ((s.whatsappClicks / s.views) * 100).toFixed(2) : '0',
      }));

    return {
      period: `${days} dias`,
      services: {
        total: services.length,
        active: services.length, // Pode adicionar lógica de ativo/inativo depois
      },
      engagement: {
        totalViews,
        totalWhatsappClicks,
        conversionRate: conversionRate.toFixed(2),
        totalFavorites: favorites,
      },
      leads: leadsStats,
      reviews: {
        total: reviews.length,
        averageRating: averageRating.toFixed(1),
      },
      topServices,
    };
  }

  async getServiceAnalytics(serviceId: string, providerId: string, days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const service = await this.servicesRepository.findOne({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }

    if (service.providerId !== providerId) {
      throw new ForbiddenException('Você não tem permissão para ver este analytics');
    }

    const leads = await this.leadsRepository.find({
      where: { 
        serviceId,
        createdAt: Between(startDate, new Date()),
      },
    });

    const reviews = await this.reviewsRepository.find({
      where: { 
        serviceId,
        createdAt: Between(startDate, new Date()),
      },
    });

    const favorites = await this.favoritesRepository.count({
      where: { serviceId },
    });

    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0;

    const conversionRate = service.views > 0 
      ? (service.whatsappClicks / service.views) * 100 
      : 0;

    return {
      period: `${days} dias`,
      views: service.views,
      whatsappClicks: service.whatsappClicks,
      conversionRate: conversionRate.toFixed(2),
      leads: leads.length,
      favorites,
      reviews: {
        total: reviews.length,
        averageRating: averageRating.toFixed(1),
      },
      leadsConverted: leads.filter(l => l.status === 'completed').length,
    };
  }

  async trackWhatsappClick(serviceId: string): Promise<void> {
    await this.servicesRepository.increment(
      { id: serviceId },
      'whatsappClicks',
      1,
    );
  }
}
