import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppScreen } from '../components/common/AppScreen';
import { MetricCard } from '../components/common/MetricCard';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { SectionTitle } from '../components/common/SectionTitle';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { colors } from '../theme/tokens';

export default function AnalyticsDashboardScreen({ navigation }: any) {
  const { currentProvider, currentProviderLeads, favoriteProviderIds } = useMarketplace();

  const data = useMemo(() => {
    if (!currentProvider) return null;

    const newLeads = currentProviderLeads.filter((lead) => lead.status === 'new').length;
    const contactedLeads = currentProviderLeads.filter((lead) => lead.status === 'contacted').length;
    const proposalLeads = currentProviderLeads.filter((lead) => lead.status === 'proposal').length;
    const closedLeads = currentProviderLeads.filter((lead) => lead.status === 'closed').length;

    const averageViews = currentProvider.projects.length
      ? Math.round(currentProvider.metrics.portfolioViews / currentProvider.projects.length)
      : 0;

    return {
      newLeads,
      contactedLeads,
      proposalLeads,
      closedLeads,
      averageViews,
      favorites: favoriteProviderIds.includes(currentProvider.id) ? 1 : 0,
    };
  }, [currentProvider, currentProviderLeads, favoriteProviderIds]);

  if (!currentProvider || !data) {
    return null;
  }

  return (
    <AppScreen scroll>
      <ScreenHeader title="Analytics" subtitle="Leituras simples sobre interesse, portfolio e leads." onBack={() => navigation.goBack()} />

      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Resumo da semana</Text>
        <Text style={styles.heroTitle}>{currentProvider.metrics.profileViews} visitas no perfil e {currentProviderLeads.length} leads mapeados.</Text>
        <Text style={styles.heroText}>Use isso para decidir quais projetos merecem mais destaque e em que etapa cada contato esta.</Text>
      </View>

      <View style={styles.metricsGrid}>
        <MetricCard label="leads novos" value={String(data.newLeads)} accent="accent" />
        <MetricCard label="leads em proposta" value={String(data.proposalLeads)} accent="sage" />
        <MetricCard label="projetos publicados" value={String(currentProvider.projects.length)} accent="gold" />
      </View>

      <View style={styles.metricsGrid}>
        <MetricCard label="media de views por projeto" value={String(data.averageViews)} accent="sage" />
        <MetricCard label="contatos fechados" value={String(data.closedLeads)} accent="accent" />
        <MetricCard label="favoritos no app" value={String(data.favorites)} accent="gold" />
      </View>

      <SectionTitle
        eyebrow="Leitura rapida"
        title="O que fazer com esses numeros"
        description="A ideia aqui nao e encher de graficos, e sim te mostrar o que mexe na conversao."
      />

      <View style={styles.insightCard}>
        <Text style={styles.insightTitle}>1. Portfolio com mais chance de gerar conversa</Text>
        <Text style={styles.insightText}>
          Os projetos de capa costumam receber mais atencao. Se quiser melhorar a conversao, mantenha na frente os cases mais alinhados ao tipo de cliente que voce quer atrair.
        </Text>
      </View>
      <View style={styles.insightCard}>
        <Text style={styles.insightTitle}>2. Leads sem resposta rapida esfriam</Text>
        <Text style={styles.insightText}>
          Hoje voce tem {data.newLeads} leads novos e {data.contactedLeads} em contato. Vale responder os novos primeiro para nao perder timing.
        </Text>
      </View>
      <View style={styles.insightCard}>
        <Text style={styles.insightTitle}>3. Atualize o portfolio regularmente</Text>
        <Text style={styles.insightText}>
          Perfis com portfolio ativo passam mais confianca. Sempre que finalizar um trabalho forte, publique um case novo ou substitua a capa principal.
        </Text>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 28,
    backgroundColor: colors.surfaceDark,
    padding: 22,
    marginBottom: 22,
  },
  heroEyebrow: {
    color: colors.gold,
    textTransform: 'uppercase',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1.1,
  },
  heroTitle: {
    marginTop: 10,
    color: colors.white,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
  },
  heroText: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.78)',
    lineHeight: 21,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  insightCard: {
    marginBottom: 12,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  insightTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 18,
  },
  insightText: {
    marginTop: 8,
    color: colors.textMuted,
    lineHeight: 21,
  },
});
