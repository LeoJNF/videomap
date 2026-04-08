import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExpoPushService } from './expo-push.service';

class TestPushDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  body?: string;
}

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly expoPushService: ExpoPushService) {}

  @Post('test')
  @UseGuards(JwtAuthGuard)
  async testPush(@Request() req: any, @Body() body: TestPushDto) {
    await this.expoPushService.sendToUser(req.user.id, {
      title: body.title || 'Teste de notificação',
      body: body.body || 'Se você recebeu isso, o push está OK.',
      data: { type: 'push:test' },
    });

    return { ok: true };
  }
}
