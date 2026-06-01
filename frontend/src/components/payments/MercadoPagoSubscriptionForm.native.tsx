import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  MercadoPagoConfig,
  montarUrlCheckoutMercadoPagoExterno,
} from '../../services/mercadoPago';
import { colors } from '../../theme/tokens';

interface Props {
  config: MercadoPagoConfig;
  providerId?: string;
  providerName: string;
  payerFullName: string;
  payerEmail: string;
  payerPhone?: string;
  documentType?: string;
  documentNumber?: string;
  onSuccess: () => void;
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
}: Props) {
  const checkoutUrl = montarUrlCheckoutMercadoPagoExterno({
    providerId,
    providerName,
    payerFullName,
    payerEmail,
    payerPhone,
    documentType,
    documentNumber,
  });

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Pagamento seguro no navegador</Text>
      <Text style={styles.text}>
        No dispositivo movel, a etapa do cartao abre em uma pagina segura do Mercado Pago.
        Depois de concluir, volte para o app e confirme o status da assinatura.
      </Text>
      <Text style={styles.meta}>
        {config.currencyId} {config.amount.toFixed(2)} por recorrencia, com {config.trialFrequency}{' '}
        {config.trialFrequencyType === 'days' ? 'dias' : config.trialFrequencyType} gratis.
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => Linking.openURL(checkoutUrl)}>
        <Text style={styles.buttonText}>Abrir pagamento seguro</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  text: {
    marginTop: 8,
    color: colors.textMuted,
    lineHeight: 20,
  },
  meta: {
    marginTop: 10,
    color: colors.text,
    fontWeight: '700',
  },
  button: {
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: colors.accentStrong,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontWeight: '800',
  },
});
