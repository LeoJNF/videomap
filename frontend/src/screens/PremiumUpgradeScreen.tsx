import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppScreen } from '../components/common/AppScreen';
import { ScreenHeader } from '../components/common/ScreenHeader';
import MercadoPagoSubscriptionForm from '../components/payments/MercadoPagoSubscriptionForm';
import { useMarketplace } from '../contexts/MarketplaceContext';
import {
  MercadoPagoConfig,
  buscarUltimaAssinaturaMercadoPago,
  obterConfiguracaoMercadoPago,
} from '../services/mercadoPago';
import { colors, shadows } from '../theme/tokens';

export default function PremiumUpgradeScreen({ navigation }: any) {
  const { currentProvider, upgradeCurrentProviderToPro, signedIn } = useMarketplace();
  const [etapa, setEtapa] = useState<'pessoal' | 'cartao' | 'sucesso'>('pessoal');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [mercadoPagoConfig, setMercadoPagoConfig] = useState<MercadoPagoConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [subscriptionSummary, setSubscriptionSummary] = useState<null | {
    subscriptionId: string;
    subscriptionStatus: string;
    nextPaymentDate?: string | null;
  }>(null);
  const [dadosPessoais, setDadosPessoais] = useState({
    nomeCompleto: currentProvider?.name || '',
    email: currentProvider?.contact.email || '',
    telefone: currentProvider?.contact.whatsapp || '',
    documento: '',
  });

  const podeAvancar = useMemo(
    () =>
      dadosPessoais.nomeCompleto.trim() &&
      dadosPessoais.email.trim() &&
      dadosPessoais.telefone.trim() &&
      dadosPessoais.documento.trim(),
    [dadosPessoais],
  );

  useEffect(() => {
    let mounted = true;

    async function carregarConfiguracao() {
      setConfigLoading(true);
      try {
        const config = await obterConfiguracaoMercadoPago();
        if (mounted) {
          setMercadoPagoConfig(config);
        }
      } catch (error: any) {
        if (mounted) {
          setFeedback(error?.message || 'Nao foi possivel carregar o Mercado Pago agora.');
        }
      } finally {
        if (mounted) {
          setConfigLoading(false);
        }
      }
    }

    carregarConfiguracao();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubscriptionSuccess(result: {
    subscriptionId: string;
    subscriptionStatus: string;
    nextPaymentDate?: string | null;
  }) {
    await upgradeCurrentProviderToPro();
    setSubscriptionSummary(result);
    setEtapa('sucesso');
    setFeedback('');
  }

  async function handleCheckExternalStatus() {
    if (!currentProvider) return;

    setLoading(true);
    setFeedback('');

    try {
      const result = await buscarUltimaAssinaturaMercadoPago({
        payerEmail: dadosPessoais.email,
        providerId: currentProvider.id,
      });

      const status = result.subscription?.status?.toLowerCase() || '';
      const okStatuses = ['authorized', 'pending', 'active'];

      if (!result.subscription || !okStatuses.includes(status)) {
        setFeedback('Ainda nao encontramos uma assinatura aprovada ou pendente para este e-mail.');
        return;
      }

      await upgradeCurrentProviderToPro();
      setSubscriptionSummary({
        subscriptionId:
          result.subscription.mercadoPagoSubscriptionId || result.subscription.id,
        subscriptionStatus: result.subscription.status,
        nextPaymentDate: result.subscription.nextPaymentDate,
      });
      setEtapa('sucesso');
    } catch (error: any) {
      setFeedback(error?.message || 'Nao foi possivel verificar a assinatura agora.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppScreen scroll>
      <ScreenHeader
        title="Plano Pro"
        subtitle="Mais destaque para quem quer usar o app como canal real de venda."
        onBack={() => navigation.goBack()}
      />

      <View style={styles.heroCard}>
        <Text style={styles.planLabel}>30 dias gratuitos</Text>
        <Text style={styles.planTitle}>Ative o Plano Pro com periodo de teste gratis.</Text>
        <Text style={styles.planText}>
          Primeiro voce preenche os dados pessoais. Em seguida, ativa o cartao com o fluxo seguro do Mercado Pago.
        </Text>
      </View>

      {signedIn && currentProvider && etapa !== 'sucesso' ? (
        <View style={styles.formCard}>
          <View style={styles.stepsRow}>
            <View style={[styles.stepBadge, etapa === 'pessoal' && styles.stepBadgeActive]}>
              <Text style={[styles.stepText, etapa === 'pessoal' && styles.stepTextActive]}>1. Dados pessoais</Text>
            </View>
            <View style={[styles.stepBadge, etapa === 'cartao' && styles.stepBadgeActive]}>
              <Text style={[styles.stepText, etapa === 'cartao' && styles.stepTextActive]}>2. Cartao</Text>
            </View>
          </View>

          {etapa === 'pessoal' ? (
            <>
              <Text style={styles.label}>Nome completo</Text>
              <TextInput
                style={styles.input}
                value={dadosPessoais.nomeCompleto}
                onChangeText={(nomeCompleto) => setDadosPessoais((current) => ({ ...current, nomeCompleto }))}
                placeholder="Seu nome completo"
                placeholderTextColor={colors.textSoft}
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={dadosPessoais.email}
                onChangeText={(email) => setDadosPessoais((current) => ({ ...current, email }))}
                placeholder="voce@email.com"
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor={colors.textSoft}
              />

              <Text style={styles.label}>Telefone</Text>
              <TextInput
                style={styles.input}
                value={dadosPessoais.telefone}
                onChangeText={(telefone) => setDadosPessoais((current) => ({ ...current, telefone }))}
                placeholder="(11) 99999-9999"
                placeholderTextColor={colors.textSoft}
              />

              <Text style={styles.label}>CPF ou documento</Text>
              <TextInput
                style={styles.input}
                value={dadosPessoais.documento}
                onChangeText={(documento) => setDadosPessoais((current) => ({ ...current, documento }))}
                placeholder="Informe o documento"
                placeholderTextColor={colors.textSoft}
              />

              <TouchableOpacity
                style={[styles.button, !podeAvancar && styles.buttonDisabled]}
                onPress={() => setEtapa('cartao')}
                disabled={!podeAvancar}
              >
                <Text style={styles.buttonText}>Avancar para os dados do cartao</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.trialCard}>
                <Text style={styles.trialTitle}>Seu teste de 30 dias gratis comeca assim que a assinatura for criada.</Text>
                <Text style={styles.trialText}>A tokenizacao do cartao acontece do jeito oficial do Mercado Pago, sem enviar o numero bruto do cartao para o VideoMap.</Text>
              </View>

              {configLoading ? (
                <View style={styles.loadingCard}>
                  <ActivityIndicator color={colors.accentStrong} />
                  <Text style={styles.loadingText}>Carregando configuracao do Mercado Pago...</Text>
                </View>
              ) : mercadoPagoConfig?.enabled ? (
                <>
                  <MercadoPagoSubscriptionForm
                    config={mercadoPagoConfig}
                    providerId={currentProvider.id}
                    providerName={currentProvider.name}
                    payerFullName={dadosPessoais.nomeCompleto}
                    payerEmail={dadosPessoais.email}
                    payerPhone={dadosPessoais.telefone}
                    documentType="CPF"
                    documentNumber={dadosPessoais.documento}
                    onSuccess={handleSubscriptionSuccess}
                  />

                  <TouchableOpacity
                    style={[styles.secondaryConfirmButton, loading && styles.buttonDisabled]}
                    onPress={handleCheckExternalStatus}
                    disabled={loading}
                  >
                    <Text style={styles.secondaryConfirmButtonText}>
                      {loading ? 'Verificando...' : 'Ja conclui o pagamento no navegador'}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.unavailableCard}>
                  <Text style={styles.unavailableTitle}>Mercado Pago ainda nao configurado</Text>
                  <Text style={styles.unavailableText}>
                    Adicione a Public Key e o Access Token no backend para liberar este fluxo.
                  </Text>
                </View>
              )}

              {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}

              <View style={styles.footerActions}>
                <TouchableOpacity style={styles.backButton} onPress={() => setEtapa('pessoal')}>
                  <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      ) : signedIn && currentProvider && etapa === 'sucesso' ? (
        <View style={styles.activeCard}>
          <Text style={styles.activeTitle}>Plano Pro ativado com sucesso.</Text>
          <Text style={styles.activeText}>
            O perfil foi atualizado no modo Pro e a assinatura recorrente foi criada no Mercado Pago.
          </Text>
          {subscriptionSummary ? (
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLine}>Assinatura: {subscriptionSummary.subscriptionId}</Text>
              <Text style={styles.summaryLine}>Status: {subscriptionSummary.subscriptionStatus}</Text>
              {subscriptionSummary.nextPaymentDate ? (
                <Text style={styles.summaryLine}>Proxima cobranca: {subscriptionSummary.nextPaymentDate}</Text>
              ) : null}
            </View>
          ) : null}
        </View>
      ) : (
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Entrar para ativar o plano</Text>
        </TouchableOpacity>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 30,
    padding: 24,
    backgroundColor: colors.goldSoft,
    ...shadows.card,
  },
  planLabel: {
    color: colors.gold,
    textTransform: 'uppercase',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1.2,
  },
  planTitle: {
    marginTop: 10,
    color: colors.text,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
  },
  planText: {
    marginTop: 10,
    color: colors.textMuted,
    lineHeight: 21,
  },
  formCard: {
    marginTop: 18,
    borderRadius: 26,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  stepsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  stepBadge: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepBadgeActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accentStrong,
  },
  stepText: {
    color: colors.textSoft,
    fontWeight: '800',
    textAlign: 'center',
    fontSize: 12,
  },
  stepTextActive: {
    color: colors.accentStrong,
  },
  trialCard: {
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  trialTitle: {
    color: colors.text,
    fontWeight: '800',
    lineHeight: 20,
  },
  trialText: {
    marginTop: 8,
    color: colors.textMuted,
    lineHeight: 20,
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
    color: colors.text,
    fontWeight: '800',
    fontSize: 13,
  },
  input: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: colors.text,
  },
  loadingCard: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  loadingText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  unavailableCard: {
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  unavailableTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 17,
  },
  unavailableText: {
    marginTop: 8,
    color: colors.textMuted,
    lineHeight: 20,
  },
  feedback: {
    marginTop: 12,
    color: colors.accentStrong,
    fontWeight: '700',
  },
  footerActions: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 10,
  },
  backButton: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.text,
    fontWeight: '800',
  },
  button: {
    marginTop: 22,
    borderRadius: 18,
    backgroundColor: colors.accentStrong,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '800',
  },
  secondaryConfirmButton: {
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 15,
    alignItems: 'center',
  },
  secondaryConfirmButtonText: {
    color: colors.text,
    fontWeight: '800',
  },
  activeCard: {
    marginTop: 22,
    borderRadius: 18,
    backgroundColor: colors.successSoft,
    padding: 18,
  },
  activeTitle: {
    color: colors.success,
    fontWeight: '800',
    fontSize: 18,
  },
  activeText: {
    marginTop: 8,
    color: colors.text,
    lineHeight: 20,
  },
  summaryBox: {
    marginTop: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.35)',
    padding: 14,
    gap: 6,
  },
  summaryLine: {
    color: colors.text,
    fontWeight: '700',
  },
});
