import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
  sound?: 'default' | null;
  data?: Record<string, any>;
};

@Injectable()
export class ExpoPushService {
  private readonly logger = new Logger(ExpoPushService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async sendToUser(
    userId: string,
    message: Omit<ExpoPushMessage, 'to'>,
  ): Promise<void> {
    const enabled = process.env.EXPO_PUSH_ENABLED !== 'false';
    if (!enabled) return;

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    const token = user?.expoPushToken;
    if (!token) return;

    await this.send({
      to: token,
      sound: 'default',
      ...message,
    });
  }

  async send(message: ExpoPushMessage): Promise<void> {
    try {
      // Node 18+ tem fetch global
      const fetchFn: typeof fetch | undefined = (globalThis as any).fetch;
      if (!fetchFn) {
        this.logger.warn('fetch() não disponível; push não enviado');
        return;
      }

      const response = await fetchFn('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        this.logger.warn(`Expo push falhou: ${response.status} ${text}`);
      }
    } catch (error: any) {
      this.logger.warn(`Erro ao enviar push: ${error?.message || error}`);
    }
  }
}
