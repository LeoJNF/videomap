import { BadRequestException, Controller, ForbiddenException, Post, Body, Get, UseGuards, Param, Put, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CloudinaryService } from '../services/cloudinary.service';
import { IsEmail, IsIn, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

class CreateUserDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(4)
  password: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsIn(['CLIENT', 'PROVIDER'])
  role?: string;
}

class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  whatsapp?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
class UpdatePushTokenDto {
  @IsString()
  @MinLength(10)
  token: string;
}

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    console.log('📥 Dados recebidos:', createUserDto);

    // ✅ VALIDAÇÃO: Verificar se os campos obrigatórios existem
    if (!createUserDto.name || !createUserDto.email || !createUserDto.password) {
      throw new BadRequestException('Campos obrigatórios faltando: name, email, password');
    }

    const user = await this.usersService.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password: createUserDto.password,
      whatsapp: createUserDto.whatsapp,
      cpf: createUserDto.cpf,
      role: createUserDto.role || 'CLIENT',
    });

    const { password, ...result } = user;
    return result;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map(({ password, cpf, email, ...user }) => user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Request() req: any) {
    const user = await this.usersService.findById(req.user.id);
    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }
    const { password, cpf, ...result } = user;
    return result;
  }

  @Put('me/push-token')
  @UseGuards(JwtAuthGuard)
  async updatePushToken(@Request() req: any, @Body() body: UpdatePushTokenDto) {
    const user = await this.usersService.setExpoPushToken(req.user.id, body.token);
    const { password, cpf, ...result } = user;
    return result;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findById(@Param('id') id: string, @Request() req: any) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    const isSelf = req?.user?.id === id;
    const { password, cpf, ...result } = user;
    if (!isSelf) {
      delete (result as any).email;
    }
    return result;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateData: UpdateUserDto, @Request() req: any) {
    // Verificar se o usuário está editando seu próprio perfil
    if (req.user.id !== id) {
      throw new ForbiddenException('Você não tem permissão para editar este perfil');
    }

    const user = await this.usersService.update(id, updateData);
    const { password, ...result } = user;
    return result;
  }

  @Post(':id/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar', {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }))
  async uploadAvatar(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Request() req: any) {
    if (req.user.id !== id) {
      throw new ForbiddenException('Você não tem permissão');
    }

    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    const avatarUrl = await this.cloudinaryService.uploadImage(file);
    const user = await this.usersService.update(id, { avatarUrl });
    const { password, ...result } = user;
    return result;
  }

  // Endpoint temporário para ativar Premium (REMOVER EM PRODUÇÃO)
  @Put(':id/toggle-premium')
  @UseGuards(JwtAuthGuard)
  async togglePremium(@Param('id') id: string, @Request() req: any) {
    const isSelf = req.user.id === id;
    if (!isSelf) {
      throw new ForbiddenException('Você não pode alterar o Premium de outro usuário');
    }

    const allowDevToggle = process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEV_PREMIUM_TOGGLE === 'true';
    if (!allowDevToggle) {
      throw new ForbiddenException('Endpoint indisponível em produção');
    }

    const user = await this.usersService.findById(id);
    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }
    const newPremiumStatus = !user.isPremium;
    
    const updated = await this.usersService.update(id, {
      isPremium: newPremiumStatus,
      premiumSince: newPremiumStatus ? new Date() : null,
    });

    const { password, ...result } = updated;
    return {
      message: newPremiumStatus ? 'Premium ativado!' : 'Premium desativado!',
      user: result,
    };
  }
}