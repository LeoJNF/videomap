import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Favorite } from '../favorites/favorite.entity';
import { Lead } from '../leads/lead.entity';
import { Review } from '../reviews/review.entity';
import { Service } from '../services/service.entity';
import { User } from '../users/user.entity';

const DEFAULT_DEMO_VIDEO_URL =
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

@Injectable()
export class DemoDataService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DemoDataService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Service)
    private readonly servicesRepository: Repository<Service>,
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    @InjectRepository(Favorite)
    private readonly favoritesRepository: Repository<Favorite>,
    @InjectRepository(Lead)
    private readonly leadsRepository: Repository<Lead>,
  ) {}

  async onApplicationBootstrap() {
    if (process.env.SEED_DEMO_DATA !== 'true') {
      return;
    }

    const usersCount = await this.usersRepository.count();
    const servicesCount = await this.servicesRepository.count();

    if (usersCount > 0 || servicesCount > 0) {
      this.logger.log('Dados existentes encontrados. Seed demo ignorado.');
      return;
    }

    const password = await bcrypt.hash('123456', 10);

    const provider = this.usersRepository.create({
      name: 'Marina Rocha',
      email: 'videomaker@videomap.local',
      password,
      whatsapp: '5511999991111',
      role: 'PROVIDER',
      bio: 'Videomaker especializada em casamentos, reels e eventos corporativos.',
      city: 'Sao Paulo',
      state: 'SP',
      isPremium: true,
      premiumSince: new Date(),
      isVerified: true,
      avatarUrl: 'https://placehold.co/400x400/0F172A/F97316?text=MR',
    });

    const client = this.usersRepository.create({
      name: 'Lucas Mendes',
      email: 'cliente@videomap.local',
      password,
      whatsapp: '5511988882222',
      role: 'CLIENT',
      city: 'Campinas',
      state: 'SP',
      avatarUrl: 'https://placehold.co/400x400/1E293B/FFFFFF?text=LM',
    });

    const [savedProvider, savedClient] = await this.usersRepository.save([
      provider,
      client,
    ]);

    const weddingService = this.servicesRepository.create({
      title: 'Filme de Casamento Cinematografico',
      description:
        'Cobertura completa do evento com teaser, filme principal e cortes para redes sociais.',
      price: 3500,
      categories: ['Casamentos', 'Publicidade'],
      location: 'Sao Paulo e regiao',
      coverUrl: 'https://placehold.co/1200x675/0F172A/F97316?text=Casamento',
      videoUrl: DEFAULT_DEMO_VIDEO_URL,
      views: 142,
      whatsappClicks: 18,
      isPinned: true,
      providerId: savedProvider.id,
    });

    const eventService = this.servicesRepository.create({
      title: 'Cobertura de Evento Corporativo',
      description:
        'Captacao multicamera para eventos, palestras e aftermovie com entrega rapida.',
      price: 2200,
      categories: ['Eventos Corporativos'],
      location: 'Campinas',
      coverUrl: 'https://placehold.co/1200x675/1E293B/38BDF8?text=Corporativo',
      videoUrl: DEFAULT_DEMO_VIDEO_URL,
      views: 87,
      whatsappClicks: 9,
      providerId: savedProvider.id,
    });

    const [savedWeddingService, savedEventService] =
      await this.servicesRepository.save([weddingService, eventService]);

    await this.reviewsRepository.save(
      this.reviewsRepository.create({
        userId: savedClient.id,
        serviceId: savedWeddingService.id,
        rating: 5,
        comment: 'Atendimento excelente e entrega super caprichada.',
      }),
    );

    await this.favoritesRepository.save(
      this.favoritesRepository.create({
        userId: savedClient.id,
        serviceId: savedWeddingService.id,
      }),
    );

    await this.leadsRepository.save(
      this.leadsRepository.create({
        clientName: savedClient.name,
        clientEmail: savedClient.email,
        clientPhone: savedClient.whatsapp,
        message:
          'Gostaria de orcamento para um casamento em novembro com teaser e filme completo.',
        budget: 4000,
        status: 'pending',
        serviceId: savedWeddingService.id,
        providerId: savedProvider.id,
        clientId: savedClient.id,
        providerNotes: 'Lead demo criado automaticamente para testes locais.',
      }),
    );

    this.logger.log('Modo demo pronto com dados locais.');
    this.logger.log(
      'Login provider: videomaker@videomap.local / 123456 | Login client: cliente@videomap.local / 123456',
    );
    this.logger.log(
      `Servicos criados: ${savedWeddingService.title} e ${savedEventService.title}`,
    );
  }
}
