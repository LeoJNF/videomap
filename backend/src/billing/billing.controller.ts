import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { BillingService } from './billing.service';
import { CreateMercadoPagoSubscriptionDto } from './dto/create-subscription.dto';

@Controller('billing/mercado-pago')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('config')
  getConfig() {
    return this.billingService.getPublicConfig();
  }

  @Post('subscriptions')
  createSubscription(@Body() body: CreateMercadoPagoSubscriptionDto) {
    return this.billingService.createSubscription(body);
  }

  @Get('subscriptions/latest')
  getLatestSubscription(
    @Query('payerEmail') payerEmail: string,
    @Query('providerId') providerId?: string,
  ) {
    return this.billingService.getLatestSubscriptionStatus(payerEmail, providerId);
  }

  @Post('webhook')
  async webhook(
    @Body() body: Record<string, any>,
    @Query() query: Record<string, any>,
  ) {
    return this.billingService.processWebhook(body, query);
  }

  @Get('checkout-page')
  async checkoutPage(
    @Query() query: Record<string, any>,
    @Res() response: Response,
  ) {
    const html = await this.billingService.renderCheckoutPageHtml(query);
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.send(html);
  }

  @Get('checkout-result')
  checkoutResult(@Res() response: Response) {
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.send(`<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>VideoMap</title>
    <style>
      body{margin:0;font-family:Arial,sans-serif;background:#08153e;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
      .card{max-width:520px;border-radius:24px;background:#0e215b;border:1px solid rgba(255,255,255,.08);padding:28px;text-align:center}
      h1{margin:0 0 12px;font-size:30px}
      p{line-height:1.6;color:rgba(255,255,255,.78)}
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Pagamento em andamento</h1>
      <p>Se a assinatura foi aprovada, o Mercado Pago vai concluir a configuracao e o VideoMap recebera a atualizacao por notificacao.</p>
      <p>Voce ja pode fechar esta janela e voltar para o app.</p>
    </div>
  </body>
</html>`);
  }
}
