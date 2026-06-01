import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import {
  CriarAssinaturaMercadoPagoResultado,
  criarAssinaturaMercadoPago,
  MercadoPagoConfig,
} from '../../services/mercadoPago';
import { colors } from '../../theme/tokens';

declare global {
  interface Window {
    MercadoPago?: any;
  }

  namespace JSX {
    interface IntrinsicElements {
      form: any;
      div: any;
      label: any;
      input: any;
      select: any;
      button: any;
    }
  }
}

interface Props {
  config: MercadoPagoConfig;
  providerId?: string;
  providerName: string;
  payerFullName: string;
  payerEmail: string;
  payerPhone?: string;
  documentType?: string;
  documentNumber?: string;
  onSuccess: (result: CriarAssinaturaMercadoPagoResultado) => void;
}

function loadMercadoPagoScript() {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.MercadoPago) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[data-mercado-pago-sdk="true"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Nao foi possivel carregar o SDK do Mercado Pago.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.dataset.mercadoPagoSdk = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Nao foi possivel carregar o SDK do Mercado Pago.'));
    document.body.appendChild(script);
  });
}

export default function MercadoPagoSubscriptionForm({
  config,
  providerId,
  providerName,
  payerFullName,
  payerEmail,
  payerPhone,
  documentType = 'CPF',
  documentNumber,
  onSuccess,
}: Props) {
  const formId = useMemo(() => `mp-form-${Math.random().toString(36).slice(2, 10)}`, []);
  const cardFormRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function setup() {
      try {
        await loadMercadoPagoScript();
        if (!mounted || !window.MercadoPago || cardFormRef.current) return;

        const mp = new window.MercadoPago(config.publicKey, { locale: 'pt-BR' });

        cardFormRef.current = mp.cardForm({
          amount: String(config.amount),
          iframe: true,
          form: {
            id: formId,
            cardNumber: { id: `${formId}__cardNumber`, placeholder: 'Numero do cartao' },
            expirationDate: { id: `${formId}__expirationDate`, placeholder: 'MM/AA' },
            securityCode: { id: `${formId}__securityCode`, placeholder: 'CVV' },
            cardholderName: { id: `${formId}__cardholderName`, placeholder: 'Titular do cartao' },
            issuer: { id: `${formId}__issuer`, placeholder: 'Banco emissor' },
            installments: { id: `${formId}__installments`, placeholder: 'Parcelas' },
            identificationType: { id: `${formId}__identificationType`, placeholder: 'Tipo de documento' },
            identificationNumber: { id: `${formId}__identificationNumber`, placeholder: 'Numero do documento' },
            cardholderEmail: { id: `${formId}__cardholderEmail`, placeholder: 'E-mail' },
          },
          callbacks: {
            onFormMounted: (formError: any) => {
              if (!mounted) return;
              if (formError) {
                setError('Nao foi possivel montar o formulario seguro do Mercado Pago.');
              }
              setLoading(false);
            },
            onSubmit: async (event: Event) => {
              event.preventDefault();
              try {
                setError('');
                setFeedback('Criando assinatura...');
                const data = cardFormRef.current.getCardFormData();

                const result = await criarAssinaturaMercadoPago({
                  planCode: config.planCode,
                  providerId,
                  providerName,
                  payerFullName:
                    (document.getElementById(`${formId}__cardholderName`) as HTMLInputElement | null)?.value ||
                    payerFullName,
                  payerEmail:
                    (document.getElementById(`${formId}__cardholderEmail`) as HTMLInputElement | null)?.value ||
                    payerEmail,
                  payerPhone,
                  documentType:
                    data.identificationType ||
                    (document.getElementById(`${formId}__identificationType`) as HTMLSelectElement | null)?.value ||
                    documentType,
                  documentNumber:
                    data.identificationNumber ||
                    (document.getElementById(`${formId}__identificationNumber`) as HTMLInputElement | null)?.value ||
                    documentNumber,
                  cardTokenId: data.token,
                  paymentMethodId: data.paymentMethodId,
                  issuerId: data.issuerId,
                });

                setFeedback('Assinatura criada com sucesso.');
                onSuccess(result);
              } catch (submitError: any) {
                setFeedback('');
                setError(submitError?.message || 'Nao foi possivel ativar a assinatura agora.');
              }
            },
          },
        });
      } catch (sdkError: any) {
        if (!mounted) return;
        setError(sdkError?.message || 'Nao foi possivel iniciar o pagamento seguro.');
        setLoading(false);
      }
    }

    setup();

    return () => {
      mounted = false;
    };
  }, [
    config.amount,
    config.planCode,
    config.publicKey,
    documentNumber,
    documentType,
    formId,
    onSuccess,
    payerEmail,
    payerFullName,
    payerPhone,
    providerId,
    providerName,
  ]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>Pagamento seguro com Mercado Pago</Text>
        <Text style={styles.headerText}>
          Os dados do cartao sao tokenizados em um campo seguro. O VideoMap nao recebe o numero bruto do cartao.
        </Text>
      </View>

      <form id={formId} style={formStyle}>
        <div style={rowStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Nome do titular</label>
            <input id={`${formId}__cardholderName`} defaultValue={payerFullName} style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>E-mail</label>
            <input id={`${formId}__cardholderEmail`} defaultValue={payerEmail} style={inputStyle} type="email" />
          </div>
        </div>

        <div style={rowStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Numero do cartao</label>
            <div id={`${formId}__cardNumber`} style={sdkFieldStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Validade</label>
            <div id={`${formId}__expirationDate`} style={sdkFieldStyle} />
          </div>
        </div>

        <div style={rowStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Codigo de seguranca</label>
            <div id={`${formId}__securityCode`} style={sdkFieldStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Banco emissor</label>
            <select id={`${formId}__issuer`} style={inputStyle} />
          </div>
        </div>

        <div style={rowStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Parcelas</label>
            <select id={`${formId}__installments`} style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Tipo de documento</label>
            <select id={`${formId}__identificationType`} style={inputStyle} />
          </div>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Numero do documento</label>
          <input id={`${formId}__identificationNumber`} defaultValue={documentNumber} style={inputStyle} />
        </div>

        <button type="submit" style={buttonStyle}>Ativar assinatura</button>
      </form>

      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.accentStrong} />
          <Text style={styles.loadingText}>Preparando formulario seguro...</Text>
        </View>
      ) : null}

      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 14,
    gap: 12,
  },
  headerCard: {
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  headerTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 17,
  },
  headerText: {
    marginTop: 8,
    color: colors.textMuted,
    lineHeight: 20,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  feedback: {
    color: colors.success,
    fontWeight: '700',
  },
  error: {
    color: colors.danger,
    fontWeight: '700',
  },
});

const formStyle = {
  display: 'grid',
  gap: '12px',
} as const;

const rowStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '12px',
} as const;

const fieldStyle = {
  display: 'grid',
  gap: '8px',
} as const;

const labelStyle = {
  color: '#b7c6ff',
  fontSize: '12px',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
} as const;

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  borderRadius: '14px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: '#091635',
  color: '#ffffff',
  padding: '14px',
  minHeight: '52px',
} as const;

const sdkFieldStyle = {
  width: '100%',
  boxSizing: 'border-box',
  borderRadius: '14px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: '#091635',
  padding: '14px',
  minHeight: '52px',
} as const;

const buttonStyle = {
  width: '100%',
  border: 'none',
  borderRadius: '16px',
  background: '#ff7a1a',
  color: '#ffffff',
  padding: '16px',
  fontSize: '16px',
  fontWeight: 800,
  cursor: 'pointer',
  marginTop: '8px',
} as const;
