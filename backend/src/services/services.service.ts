import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './service.entity';
import { User } from '../users/user.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(data: Partial<Service>): Promise<Service> {
    const service = this.servicesRepository.create(data);
    return this.servicesRepository.save(service);
  }

  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    // Buscar com ordenação: Premium primeiro, depois pinned, depois por data
    const [data, total] = await this.servicesRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.provider', 'provider')
      .orderBy('provider.isPremium', 'DESC')
      .addOrderBy('service.isPinned', 'DESC')
      .addOrderBy('service.createdAt', 'DESC')
      .take(limit)
      .skip(skip)
      .getManyAndCount();

    // Add rating stats to each service
    const servicesWithRatings = await Promise.all(
      data.map(async (service) => {
        const ratings = await this.servicesRepository
          .createQueryBuilder()
          .select('AVG(review.rating)', 'average')
          .addSelect('COUNT(review.id)', 'count')
          .from('reviews', 'review')
          .where('review.serviceId = :serviceId', { serviceId: service.id })
          .getRawOne();

        return {
          ...service,
          averageRating: ratings.average ? parseFloat(ratings.average) : 0,
          reviewCount: ratings.count ? parseInt(ratings.count) : 0,
        };
      })
    );

    return {
      data: servicesWithRatings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Service> {
    const service = await this.servicesRepository.findOne({
      where: { id },
      relations: ['provider'],
    });

    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }

    service.views += 1;
    await this.servicesRepository.save(service);

    return service;
  }

  async findByProvider(providerId: string): Promise<Service[]> {
    return this.servicesRepository.find({
      where: { providerId },
      order: { createdAt: 'DESC' },
    });
  }

  async search(query: string): Promise<Service[]> {
    return this.servicesRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.provider', 'provider')
      .where('service.title ILIKE :query', { query: `%${query}%` })
      .orWhere('service.location ILIKE :query', { query: `%${query}%` })
      .orderBy('service.createdAt', 'DESC')
      .getMany();
  }

  async delete(id: string, userId: string): Promise<void> {
    const service = await this.servicesRepository.findOne({ where: { id } });

    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }

    if (service.providerId !== userId) {
      throw new Error('Você não tem permissão');
    }

    await this.servicesRepository.delete(id);
  }

  async togglePin(id: string, userId: string): Promise<Service> {
    const service = await this.servicesRepository.findOne({
      where: { id },
      relations: ['provider'],
    });

    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }

    if (service.providerId !== userId) {
      throw new ForbiddenException('Você não tem permissão');
    }

    const provider = service.provider;
    if (!provider) {
      throw new BadRequestException('Provider não encontrado');
    }

    if (!provider.isPremium) {
      throw new ForbiddenException('Fixar serviços é um recurso Premium');
    }

    const willPin = !service.isPinned;
    if (willPin) {
      const pinnedCount = await this.servicesRepository.count({
        where: { providerId: userId, isPinned: true },
      });
      if (pinnedCount >= 3) {
        throw new BadRequestException('Limite de 3 serviços fixados atingido');
      }
    }

    service.isPinned = !service.isPinned;
    return this.servicesRepository.save(service);
  }
}
