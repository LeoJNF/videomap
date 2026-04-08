import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './favorite.entity';
import { Service } from '../services/service.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoritesRepository: Repository<Favorite>,
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
  ) {}

  async addFavorite(userId: string, serviceId: string): Promise<Favorite> {
    // Check if service exists
    const service = await this.servicesRepository.findOne({ where: { id: serviceId } });
    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }

    // Check if already favorited
    const existing = await this.favoritesRepository.findOne({
      where: { userId, serviceId },
    });

    if (existing) {
      throw new ConflictException('Serviço já está nos favoritos');
    }

    const favorite = this.favoritesRepository.create({
      userId,
      serviceId,
    });

    return this.favoritesRepository.save(favorite);
  }

  async removeFavorite(userId: string, serviceId: string): Promise<void> {
    const favorite = await this.favoritesRepository.findOne({
      where: { userId, serviceId },
    });

    if (!favorite) {
      throw new NotFoundException('Favorito não encontrado');
    }

    await this.favoritesRepository.remove(favorite);
  }

  async getUserFavorites(userId: string): Promise<Service[]> {
    const favorites = await this.favoritesRepository.find({
      where: { userId },
      relations: ['service', 'service.provider'],
      order: { createdAt: 'DESC' },
    });

    return favorites.map(fav => fav.service);
  }

  async isFavorited(userId: string, serviceId: string): Promise<boolean> {
    const favorite = await this.favoritesRepository.findOne({
      where: { userId, serviceId },
    });

    return !!favorite;
  }

  async checkMultipleFavorites(userId: string, serviceIds: string[]): Promise<{ [key: string]: boolean }> {
    const favorites = await this.favoritesRepository.find({
      where: { userId },
      select: ['serviceId'],
    });

    const favoritedIds = new Set(favorites.map(f => f.serviceId));
    
    const result: { [key: string]: boolean } = {};
    serviceIds.forEach(id => {
      result[id] = favoritedIds.has(id);
    });

    return result;
  }
}
