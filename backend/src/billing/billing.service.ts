import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { BillingPlan } from './billing-plan.entity';
import { BillingSubscription } from './billing-subscription.entity';
import { CreateMercadoPagoSubscriptionDto } from './dto/create-subscription.dto';

interface MercadoPagoRequestOptions extends RequestInit {
  idempotencyKey?: string;
}

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(BillingPlan)
    private readonly billingPlanRepository: Repository<BillingPlan>,
    @InjectRepository(BillingSubscription)
    private readonly billingSubscriptionRepository: Repository<BillingSubscription>,
  ) {}

  getPublicConfig() {
    const publicKey = this.configService.get<string>('MERCADO_PAGO_PUBLIC_KEY');
    const accessToken = this.configService.get<string>('MERCADO_PAGO_ACCESS_TOKEN');
    const amount = this.getPlanAmount();
    const trialDays = this.getPlanFreeTrialFrequency();

    return {
      enabled: Boolean(publicKey && accessToken),
      publicKey: publicKey || null,
      planCode: this.getPlanCode(),
      planReason: this.getPlanReason(),
      amount,
      currencyId: this.getPlanCurrency(),
      trialFrequency: trialDays,
      trialFrequencyType: this.getPlanFreeTrialFrequencyType(),
    };
  }

  async createSubscription(dto: CreateMercadoPagoSubscriptionDto) {
    this.ensureMercadoPagoConfigured();

    const plan = await this.ensurePlan(dto.planCode || this.getPlanCode());
    const externalReference = `videomap:${dto.providerId || 'provider'}:${Date.now()}`;
    const now = new Date().toISOString();

    const payload = {
      preapproval_plan_id: plan.mercadoPagoPlanId,
      reason: plan.reason,
      external_reference: externalReference,
      payer_email: dto.payerEmail,
      card_token_id: dto.cardTokenId,
      auto_recurring: {
        frequency: plan.frequency,
        frequency_type: plan.frequencyType,
        transaction_amount: Number(plan.amount),
        currency_id: plan.currencyId,
        start_date: now,
      },
      back_url: plan.backUrl,
      status: 'authorized',
    };

    const response = await this.mercadoPagoRequest('/preapproval', {
      method: 'POST',
      body: JSON.stringify(payload),
      idempotencyKey: randomUUID(),
    });

    const subscription = this.billingSubscriptionRepository.create({
      planCode: plan.code,
      mercadoPagoPlanId: plan.mercadoPagoPlanId,
      externalReference,
      mercadoPagoSubscriptionId: response.id || null,
      providerId: dto.providerId || null,
      providerName: dto.providerName,
      payerEmail: dto.payerEmail,
      payerFullName: dto.payerFullName,
      payerPhone: dto.payerPhone || null,
      documentType: dto.documentType || null,
      documentNumber: dto.documentNumber || null,
      paymentMethodId: dto.paymentMethodId || null,
      issuerId: dto.issuerId || null,
      status: response.status || 'pending',
      initPoint: response.init_point || null,
      nextPaymentDate: response.next_payment_date || null,
      rawSnapshot: response,
    });

    await this.billingSubscriptionRepository.save(subscription);

    return {
      ok: true,
      provider: 'mercado_pago',
      planCode: plan.code,
      planReason: plan.reason,
      amount: Number(plan.amount),
      currencyId: plan.currencyId,
      freeTrial: {
        frequency: plan.freeTrialFrequency,
        frequencyType: plan.freeTrialFrequencyType,
      },
      subscriptionId: response.id,
      subscriptionStatus: response.status,
      nextPaymentDate: response.next_payment_date || null,
      initPoint: response.init_point || null,
      externalReference,
    };
  }

  async getLatestSubscriptionStatus(payerEmail: string, providerId?: string) {
    if (!payerEmail) {
      throw new BadRequestException('Informe o e-mail do assinante.');
    }

    const where = providerId
      ? { payerEmail, providerId }
      : { payerEmail };

    const subscription = await this.billingSubscriptionRepository.findOne({
      where,
      order: { createdAt: 'DESC' },
    });

    return {
      ok: true,
      subscription: subscription
        ? {
            id: subscription.id,
            mercadoPagoSubscriptionId: subscription.mercadoPagoSubscriptionId,
            status: subscription.status,
            nextPaymentDate: subscription.nextPaymentDate,
            createdAt: subscription.createdAt,
            externalReference: subscription.externalReference,
          }
        : null,
    };
  }

  async processWebhook(payload: Record<string, any>, query: Record<string, any>) {
    const topic =
      payload?.type ||
      payload?.topic ||
      query?.type ||
      query?.topic ||
      query?.action ||
      null;

    const dataId =
      payload?.data?.id ||
      query?.['data.id'] ||
      query?.id ||
      null;

    if (!topic || !dataId) {
      return { ok: true, ignored: true };
    }

    if (topic === 'subscription_preapproval') {
      const resource = await this.mercadoPagoRequest(`/preapproval/${dataId}`, {
        method: 'GET',
      });

      const existing =
        (await this.billingSubscriptionRepository.findOne({
          where: [{ mercadoPagoSubscriptionId: resource.id }, { externalReference: resource.external_reference }],
        })) || null;

      if (existing) {
        existing.status = resource.status || existing.status;
        existing.nextPaymentDate = resource.next_payment_date || existing.nextPaymentDate || null;
        existing.initPoint = resource.init_point || existing.initPoint || null;
        existing.rawSnapshot = resource;
        await this.billingSubscriptionRepository.save(existing);
      }

      return { ok: true, topic, updated: Boolean(existing) };
    }

    if (topic === 'subscription_preapproval_plan') {
      const resource = await this.mercadoPagoRequest(`/preapproval_plan/${dataId}`, {
        method: 'GET',
      });

      const existing = await this.billingPlanRepository.findOne({
        where: { mercadoPagoPlanId: resource.id },
      });

      if (existing) {
        existing.active = resource.status === 'active';
        existing.rawSnapshot = resource;
        await this.billingPlanRepository.save(existing);
      }

      return { ok: true, topic, updated: Boolean(existing) };
    }

    return { ok: true, topic, ignored: true };
  }

  async renderCheckoutPageHtml(query: Record<string, any>) {
    const config = this.getPublicConfig();
    if (!config.enabled || !config.publicKey) {
      throw new BadRequestException('Mercado Pago nao configurado no backend.');
    }

    const providerName = String(query.providerName || 'VideoMap Pro');
    const providerId = String(query.providerId || '');
    const payerFullName = String(query.payerFullName || '');
    const payerEmail = String(query.payerEmail || '');
    const payerPhone = String(query.payerPhone || '');
    const documentType = String(query.documentType || 'CPF');
    const documentNumber = String(query.documentNumber || '');
    const amount = Number(config.amount).toFixed(2);
    const endpoint = `${this.getAppBaseUrl()}/billing/mercado-pago/subscriptions`;

    return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>VideoMap + Mercado Pago</title>
    <script src="https://sdk.mercadopago.com/js/v2"></script>
    <style>
      body{margin:0;background:#07153d;color:#fff;font-family:Arial,sans-serif;padding:24px}
      .wrap{max-width:720px;margin:0 auto;background:#0d1f57;border:1px solid rgba(255,255,255,.08);border-radius:24px;padding:24px}
      h1{margin:0 0 8px;font-size:32px}
      p{color:rgba(255,255,255,.78);line-height:1.55}
      .row{display:grid;gap:12px;grid-template-columns:1fr 1fr}
      .field,.mp-field{margin-top:14px}
      label{display:block;font-size:12px;font-weight:700;letter-spacing:.04em;margin-bottom:8px;text-transform:uppercase;color:#b7c6ff}
      input,select,.mp-field-inner{width:100%;box-sizing:border-box;border-radius:14px;border:1px solid rgba(255,255,255,.12);background:#091635;color:#fff;padding:14px}
      #form-checkout__cardNumber,#form-checkout__expirationDate,#form-checkout__securityCode{padding:14px;border-radius:14px;border:1px solid rgba(255,255,255,.12);background:#091635}
      button{margin-top:22px;width:100%;border:none;border-radius:16px;background:#ff7a1a;color:#fff;padding:16px;font-size:16px;font-weight:800;cursor:pointer}
      button:disabled{opacity:.55;cursor:not-allowed}
      .notice{margin-top:18px;padding:16px;border-radius:16px;background:rgba(15,123,255,.12);border:1px solid rgba(15,123,255,.25)}
      .success{background:rgba(24,175,111,.14);border-color:rgba(24,175,111,.35)}
      .error{background:rgba(255,86,86,.14);border-color:rgba(255,86,86,.35)}
      .muted{font-size:13px;color:rgba(255,255,255,.68)}
      @media (max-width:760px){.row{grid-template-columns:1fr}}
    </style>
  </head>
  <body>
    <div class="wrap">
      <h1>Plano Pro VideoMap</h1>
      <p>Teste gratis de ${config.trialFrequency} ${config.trialFrequencyType === 'days' ? 'dias' : config.trialFrequencyType}. Depois disso, a recorrencia passa para ${config.currencyId} ${amount} por ${config.planReason.toLowerCase().includes('mes') ? 'mes' : 'mes'}.</p>
      <div class="notice">
        <strong>Pagamento seguro</strong>
        <p class="muted">Os dados do cartao sao tokenizados pelo Mercado Pago. O VideoMap nao recebe o numero bruto do cartao.</p>
      </div>
      <form id="form-checkout">
        <div class="row">
          <div class="field">
            <label>Nome do titular</label>
            <input id="form-checkout__cardholderName" value="${this.escapeHtml(
              payerFullName,
            )}" />
          </div>
          <div class="field">
            <label>E-mail</label>
            <input id="form-checkout__cardholderEmail" type="email" value="${this.escapeHtml(
              payerEmail,
            )}" />
          </div>
        </div>
        <div class="row">
          <div class="field">
            <label>Numero do cartao</label>
            <div id="form-checkout__cardNumber"></div>
          </div>
          <div class="field">
            <label>Validade</label>
            <div id="form-checkout__expirationDate"></div>
          </div>
        </div>
        <div class="row">
          <div class="field">
            <label>Codigo de seguranca</label>
            <div id="form-checkout__securityCode"></div>
          </div>
          <div class="field">
            <label>Banco emissor</label>
            <select id="form-checkout__issuer"></select>
          </div>
        </div>
        <div class="row">
          <div class="field">
            <label>Parcelas</label>
            <select id="form-checkout__installments"></select>
          </div>
          <div class="field">
            <label>Tipo de documento</label>
            <select id="form-checkout__identificationType"></select>
          </div>
        </div>
        <div class="field">
          <label>Numero do documento</label>
          <input id="form-checkout__identificationNumber" value="${this.escapeHtml(
            documentNumber,
          )}" />
        </div>
        <button id="form-checkout__submit" type="submit">Ativar assinatura</button>
      </form>
      <div id="feedback" class="notice" style="display:none"></div>
    </div>
    <script>
      const feedback = document.getElementById('feedback');
      const button = document.getElementById('form-checkout__submit');
      const mp = new MercadoPago(${JSON.stringify(config.publicKey)}, { locale: 'pt-BR' });
      const cardForm = mp.cardForm({
        amount: '${amount}',
        iframe: true,
        form: {
          id: 'form-checkout',
          cardNumber: { id: 'form-checkout__cardNumber', placeholder: 'Numero do cartao' },
          expirationDate: { id: 'form-checkout__expirationDate', placeholder: 'MM/AA' },
          securityCode: { id: 'form-checkout__securityCode', placeholder: 'CVV' },
          cardholderName: { id: 'form-checkout__cardholderName', placeholder: 'Titular do cartao' },
          issuer: { id: 'form-checkout__issuer', placeholder: 'Banco emissor' },
          installments: { id: 'form-checkout__installments', placeholder: 'Parcelas' },
          identificationType: { id: 'form-checkout__identificationType', placeholder: 'Tipo de documento' },
          identificationNumber: { id: 'form-checkout__identificationNumber', placeholder: 'Numero do documento' },
          cardholderEmail: { id: 'form-checkout__cardholderEmail', placeholder: 'E-mail' },
        },
        callbacks: {
          onSubmit: async (event) => {
            event.preventDefault();
            button.disabled = true;
            feedback.style.display = 'block';
            feedback.className = 'notice';
            feedback.innerHTML = 'Criando assinatura...';
            const data = cardForm.getCardFormData();
            try {
              const response = await fetch(${JSON.stringify(endpoint)}, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  planCode: ${JSON.stringify(config.planCode)},
                  providerId: ${JSON.stringify(providerId)},
                  providerName: ${JSON.stringify(providerName)},
                  payerFullName: document.getElementById('form-checkout__cardholderName').value,
                  payerEmail: document.getElementById('form-checkout__cardholderEmail').value,
                  payerPhone: ${JSON.stringify(payerPhone)},
                  documentType: data.identificationType || ${JSON.stringify(documentType)},
                  documentNumber: data.identificationNumber || document.getElementById('form-checkout__identificationNumber').value,
                  cardTokenId: data.token,
                  paymentMethodId: data.paymentMethodId,
                  issuerId: data.issuerId
                })
              });
              const result = await response.json();
              if (!response.ok) {
                throw new Error(result.message || 'Nao foi possivel criar a assinatura.');
              }
              feedback.className = 'notice success';
              feedback.innerHTML = '<strong>Assinatura criada com sucesso.</strong><p class="muted">Voce ja pode voltar para o app. Se estiver no navegador, feche esta janela.</p>';
            } catch (error) {
              feedback.className = 'notice error';
              feedback.innerHTML = '<strong>Erro ao ativar assinatura.</strong><p class="muted">' + (error.message || 'Tente novamente.') + '</p>';
            } finally {
              button.disabled = false;
            }
          }
        }
      });
    </script>
  </body>
</html>`;
  }

  private async ensurePlan(code: string) {
    const existing = await this.billingPlanRepository.findOne({ where: { code } });
    if (existing) return existing;

    const configuredPlanId = this.configService.get<string>('MERCADO_PAGO_PLAN_ID');
    if (configuredPlanId) {
      const resource = await this.mercadoPagoRequest(`/preapproval_plan/${configuredPlanId}`, {
        method: 'GET',
      });

      const plan = this.billingPlanRepository.create({
        code,
        reason: resource.reason || this.getPlanReason(),
        mercadoPagoPlanId: resource.id,
        amount: Number(resource?.auto_recurring?.transaction_amount || this.getPlanAmount()),
        currencyId: resource?.auto_recurring?.currency_id || this.getPlanCurrency(),
        frequency: Number(resource?.auto_recurring?.frequency || this.getPlanFrequency()),
        frequencyType: resource?.auto_recurring?.frequency_type || this.getPlanFrequencyType(),
        repetitions:
          resource?.auto_recurring?.repetitions !== undefined
            ? Number(resource.auto_recurring.repetitions)
            : this.getPlanRepetitions(),
        freeTrialFrequency: Number(
          resource?.auto_recurring?.free_trial?.frequency ||
            this.getPlanFreeTrialFrequency(),
        ),
        freeTrialFrequencyType:
          resource?.auto_recurring?.free_trial?.frequency_type ||
          this.getPlanFreeTrialFrequencyType(),
        backUrl: resource.back_url || this.getPlanBackUrl(),
        active: resource.status === 'active',
        rawSnapshot: resource,
      });

      return this.billingPlanRepository.save(plan);
    }

    const createPayload: Record<string, any> = {
      reason: this.getPlanReason(),
      auto_recurring: {
        frequency: this.getPlanFrequency(),
        frequency_type: this.getPlanFrequencyType(),
        billing_day: this.getPlanBillingDay(),
        billing_day_proportional: true,
        free_trial: {
          frequency: this.getPlanFreeTrialFrequency(),
          frequency_type: this.getPlanFreeTrialFrequencyType(),
        },
        transaction_amount: this.getPlanAmount(),
        currency_id: this.getPlanCurrency(),
      },
      back_url: this.getPlanBackUrl(),
    };

    const repetitions = this.getPlanRepetitions();
    if (repetitions) {
      createPayload.auto_recurring.repetitions = repetitions;
    }

    const resource = await this.mercadoPagoRequest('/preapproval_plan', {
      method: 'POST',
      body: JSON.stringify(createPayload),
      idempotencyKey: randomUUID(),
    });

    const plan = this.billingPlanRepository.create({
      code,
      reason: resource.reason || this.getPlanReason(),
      mercadoPagoPlanId: resource.id,
      amount: Number(resource?.auto_recurring?.transaction_amount || this.getPlanAmount()),
      currencyId: resource?.auto_recurring?.currency_id || this.getPlanCurrency(),
      frequency: Number(resource?.auto_recurring?.frequency || this.getPlanFrequency()),
      frequencyType: resource?.auto_recurring?.frequency_type || this.getPlanFrequencyType(),
      repetitions:
        resource?.auto_recurring?.repetitions !== undefined
          ? Number(resource.auto_recurring.repetitions)
          : repetitions,
      freeTrialFrequency: Number(
        resource?.auto_recurring?.free_trial?.frequency ||
          this.getPlanFreeTrialFrequency(),
      ),
      freeTrialFrequencyType:
        resource?.auto_recurring?.free_trial?.frequency_type ||
        this.getPlanFreeTrialFrequencyType(),
      backUrl: resource.back_url || this.getPlanBackUrl(),
      active: resource.status === 'active',
      rawSnapshot: resource,
    });

    return this.billingPlanRepository.save(plan);
  }

  private ensureMercadoPagoConfigured() {
    const publicKey = this.configService.get<string>('MERCADO_PAGO_PUBLIC_KEY');
    const accessToken = this.configService.get<string>('MERCADO_PAGO_ACCESS_TOKEN');

    if (!publicKey || !accessToken) {
      throw new BadRequestException(
        'Configure MERCADO_PAGO_PUBLIC_KEY e MERCADO_PAGO_ACCESS_TOKEN para ativar pagamentos.',
      );
    }
  }

  private async mercadoPagoRequest(path: string, init: MercadoPagoRequestOptions) {
    const accessToken = this.configService.get<string>('MERCADO_PAGO_ACCESS_TOKEN');
    if (!accessToken) {
      throw new BadRequestException('Access Token do Mercado Pago nao configurado.');
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init.idempotencyKey
        ? { 'X-Idempotency-Key': init.idempotencyKey }
        : {}),
    };

    const response = await fetch(`https://api.mercadopago.com${path}`, {
      method: init.method,
      headers,
      body: init.body,
    });

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      this.logger.error(`Mercado Pago ${path} falhou`, JSON.stringify(data));
      const message =
        typeof data === 'object' && data !== null
          ? data.message || data.error || 'Erro na comunicacao com o Mercado Pago.'
          : 'Erro na comunicacao com o Mercado Pago.';
      throw new BadRequestException(message);
    }

    return data;
  }

  private getPlanCode() {
    return this.configService.get<string>('MERCADO_PAGO_PLAN_CODE', 'videomap-pro');
  }

  private getPlanReason() {
    return this.configService.get<string>('MERCADO_PAGO_PLAN_REASON', 'Plano Pro VideoMap');
  }

  private getPlanAmount() {
    return Number(this.configService.get<string>('MERCADO_PAGO_PLAN_AMOUNT', '49.90'));
  }

  private getPlanCurrency() {
    return this.configService.get<string>('MERCADO_PAGO_PLAN_CURRENCY', 'BRL');
  }

  private getPlanFrequency() {
    return Number(this.configService.get<string>('MERCADO_PAGO_PLAN_FREQUENCY', '1'));
  }

  private getPlanFrequencyType() {
    return this.configService.get<string>('MERCADO_PAGO_PLAN_FREQUENCY_TYPE', 'months');
  }

  private getPlanRepetitions() {
    const raw = this.configService.get<string>('MERCADO_PAGO_PLAN_REPETITIONS');
    if (!raw) return null;
    return Number(raw);
  }

  private getPlanBillingDay() {
    return Number(this.configService.get<string>('MERCADO_PAGO_PLAN_BILLING_DAY', '10'));
  }

  private getPlanFreeTrialFrequency() {
    return Number(
      this.configService.get<string>('MERCADO_PAGO_FREE_TRIAL_FREQUENCY', '30'),
    );
  }

  private getPlanFreeTrialFrequencyType() {
    return this.configService.get<string>(
      'MERCADO_PAGO_FREE_TRIAL_FREQUENCY_TYPE',
      'days',
    );
  }

  private getPlanBackUrl() {
    return (
      this.configService.get<string>('MERCADO_PAGO_BACK_URL') ||
      `${this.getAppBaseUrl()}/billing/mercado-pago/checkout-result`
    );
  }

  private getAppBaseUrl() {
    return this.configService.get<string>('APP_BASE_URL', 'http://localhost:7000');
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
