import api, { apiBaseUrl } from './api';

export interface MercadoPagoConfig {
  enabled: boolean;
  publicKey: string | null;
  planCode: string;
  planReason: string;
  amount: number;
  currencyId: string;
  trialFrequency: number;
  trialFrequencyType: string;
}

export interface CriarAssinaturaMercadoPagoPayload {
  planCode: string;
  providerId?: string;
  providerName: string;
  payerFullName: string;
  payerEmail: string;
  payerPhone?: string;
  documentType?: string;
  documentNumber?: string;
  cardTokenId: string;
  paymentMethodId?: string;
  issuerId?: string;
}

export interface CriarAssinaturaMercadoPagoResultado {
  ok: boolean;
  provider: 'mercado_pago';
  planCode: string;
  planReason: string;
  amount: number;
  currencyId: string;
  freeTrial: {
    frequency: number;
    frequencyType: string;
  };
  subscriptionId: string;
  subscriptionStatus: string;
  nextPaymentDate?: string | null;
  initPoint?: string | null;
  externalReference: string;
}

export interface UltimaAssinaturaMercadoPagoResultado {
  ok: boolean;
  subscription: null | {
    id: string;
    mercadoPagoSubscriptionId?: string | null;
    status: string;
    nextPaymentDate?: string | null;
    createdAt: string;
    externalReference: string;
  };
}

export async function obterConfiguracaoMercadoPago(): Promise<MercadoPagoConfig> {
  const response = await api.get('/billing/mercado-pago/config');
  return response.data;
}

export async function criarAssinaturaMercadoPago(
  payload: CriarAssinaturaMercadoPagoPayload,
): Promise<CriarAssinaturaMercadoPagoResultado> {
  const response = await api.post('/billing/mercado-pago/subscriptions', payload);
  return response.data;
}

export async function buscarUltimaAssinaturaMercadoPago(input: {
  payerEmail: string;
  providerId?: string;
}): Promise<UltimaAssinaturaMercadoPagoResultado> {
  const response = await api.get('/billing/mercado-pago/subscriptions/latest', {
    params: input,
  });
  return response.data;
}

export function montarUrlCheckoutMercadoPagoExterno(input: {
  providerId?: string;
  providerName: string;
  payerFullName: string;
  payerEmail: string;
  payerPhone?: string;
  documentType?: string;
  documentNumber?: string;
}) {
  const query = new URLSearchParams();
  query.set('providerName', input.providerName);
  query.set('payerFullName', input.payerFullName);
  query.set('payerEmail', input.payerEmail);

  if (input.providerId) query.set('providerId', input.providerId);
  if (input.payerPhone) query.set('payerPhone', input.payerPhone);
  if (input.documentType) query.set('documentType', input.documentType);
  if (input.documentNumber) query.set('documentNumber', input.documentNumber);

  return `${apiBaseUrl}/billing/mercado-pago/checkout-page?${query.toString()}`;
}
