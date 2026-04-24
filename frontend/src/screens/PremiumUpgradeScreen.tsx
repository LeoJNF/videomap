import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppScreen } from '../components/common/AppScreen';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { colors, shadows } from '../theme/tokens';

export default function PremiumUpgradeScreen({ navigation }: any) {
  const { currentProvider, upgradeCurrentProviderToPro, signedIn } = useMarketplace();
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    await upgradeCurrentProviderToPro();
    setLoading(false);
    navigation.goBack();
  }

  return (
    <AppScreen scroll>
      <ScreenHeader title="Studio Pro" subtitle="Mais destaque para quem quer usar o app como canal real de venda." onBack={() => navigation.goBack()} />

      <View style={styles.heroCard}>
        <Text style={styles.planLabel}>Plano destaque</Text>
        <Text style={styles.planTitle}>Seu portfolio aparece com mais presenca e contexto comercial.</Text>
        <Text style={styles.planText}>Pensado para videomakers que querem transformar o catalogo em um funil mais forte de descoberta e briefing qualificado.</Text>
      </View>

      {[
        'Selo Studio Pro no perfil e nos cards do catalogo.',
        'Posicionamento prioritario em areas de curadoria do app.',
        'Mais espaco para apresentar portfolio, entregas e proposta.',
      ].map((item) => (
        <View key={item} style={styles.featureCard}>
          <Text style={styles.featureText}>{item}</Text>
        </View>
      ))}

      {signedIn && currentProvider && !currentProvider.isPro ? (
        <TouchableOpacity style={styles.button} onPress={handleUpgrade} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Ativando...' : 'Ativar Studio Pro no demo'}</Text>
        </TouchableOpacity>
      ) : signedIn && currentProvider?.isPro ? (
        <View style={styles.activeCard}>
          <Text style={styles.activeTitle}>Seu perfil ja esta com Studio Pro ativo.</Text>
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
  featureCard: {
    marginTop: 12,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  featureText: {
    color: colors.text,
    lineHeight: 20,
    fontWeight: '700',
  },
  button: {
    marginTop: 22,
    borderRadius: 18,
    backgroundColor: colors.accentStrong,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontWeight: '800',
  },
  activeCard: {
    marginTop: 22,
    borderRadius: 18,
    backgroundColor: colors.successSoft,
    padding: 18,
    alignItems: 'center',
  },
  activeTitle: {
    color: colors.success,
    fontWeight: '800',
  },
});


