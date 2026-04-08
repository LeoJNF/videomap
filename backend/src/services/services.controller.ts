import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ServicesService } from './services.service';
import { CloudinaryService } from './cloudinary.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('services')
export class ServicesController {
  constructor(
    private servicesService: ServicesService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  async findAll(@Query('page') page: string, @Query('limit') limit: string) {
    return this.servicesService.findAll(
      parseInt(page) || 1,
      parseInt(limit) || 20,
    );
  }

  @Get('search')
  async search(@Query('q') query: string) {
    return this.servicesService.search(query);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.servicesService.findById(id);
  }

  @Get('provider/:id')
  async findByProvider(@Param('id') providerId: string) {
    return this.servicesService.findByProvider(providerId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('video'))
  async create(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    const localDemoMode =
      process.env.LOCAL_DEMO_MODE === 'true' ||
      process.env.DB_TYPE === 'sqljs';

    if (req.user.role !== 'PROVIDER') {
      throw new ForbiddenException('Apenas videomakers podem publicar serviços');
    }

    if (!file && !localDemoMode) {
      throw new BadRequestException('Envie um vídeo no campo "video"');
    }

    if (!body?.title || !body?.price || !body?.location) {
      throw new BadRequestException('Campos obrigatórios: title, price, location');
    }

    const videoUrl = await this.cloudinaryService.uploadVideo(file);

    // Parse categories se vier como string JSON
    let categories = body.categories;
    if (typeof categories === 'string') {
      categories = JSON.parse(categories);
    }

    const service = await this.servicesService.create({
      title: body.title,
      description: body.description,
      price: parseFloat(body.price),
      categories: categories || [],
      location: body.location,
      coverUrl: body.coverUrl,
      videoUrl,
      providerId: req.user.id,
    });

    return service;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Request() req) {
    await this.servicesService.delete(id, req.user.id);
    return { message: 'Serviço deletado' };
  }

  @Post(':id/pin')
  @UseGuards(JwtAuthGuard)
  async togglePin(@Param('id') id: string, @Request() req) {
    if (req.user.role !== 'PROVIDER') {
      throw new ForbiddenException('Apenas videomakers podem fixar serviços');
    }
    const service = await this.servicesService.togglePin(id, req.user.id);
    return { 
      message: service.isPinned ? 'Serviço fixado' : 'Serviço desfixado',
      isPinned: service.isPinned,
    };
  }
}

