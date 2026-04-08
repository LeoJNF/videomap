import { Controller, Get, Post, Delete, Param, UseGuards, Request, Body } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  async getUserFavorites(@Request() req) {
    return this.favoritesService.getUserFavorites(req.user.id);
  }

  @Post(':serviceId')
  async addFavorite(@Request() req, @Param('serviceId') serviceId: string) {
    const favorite = await this.favoritesService.addFavorite(req.user.id, serviceId);
    return { message: 'Serviço adicionado aos favoritos', favorite };
  }

  @Delete(':serviceId')
  async removeFavorite(@Request() req, @Param('serviceId') serviceId: string) {
    await this.favoritesService.removeFavorite(req.user.id, serviceId);
    return { message: 'Serviço removido dos favoritos' };
  }

  @Get('check/:serviceId')
  async checkFavorite(@Request() req, @Param('serviceId') serviceId: string) {
    const isFavorited = await this.favoritesService.isFavorited(req.user.id, serviceId);
    return { isFavorited };
  }

  @Post('check-multiple')
  async checkMultipleFavorites(@Request() req, @Body() body: { serviceIds: string[] }) {
    const favorites = await this.favoritesService.checkMultipleFavorites(req.user.id, body.serviceIds);
    return favorites;
  }
}
