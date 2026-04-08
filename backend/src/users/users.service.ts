import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(data: Partial<User>): Promise<User> {
    try {
      console.log('📝 Tentando criar usuário:', data.email);

      const existingUser = await this.usersRepository.findOne({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new ConflictException('Email já cadastrado');
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = this.usersRepository.create({
        ...data,
        password: hashedPassword,
      });

      const savedUser = await this.usersRepository.save(user);
      console.log('✅ Usuário criado:', savedUser.id);
      
      return savedUser;
    } catch (error) {
      console.error('❌ ERRO ao criar usuário:', error.message);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Não permitir atualização de senha ou email por aqui
    delete data.password;
    delete data.email;

    Object.assign(user, data);
    return this.usersRepository.save(user);
  }

  async setExpoPushToken(id: string, token: string): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    user.expoPushToken = token;
    return this.usersRepository.save(user);
  }
}