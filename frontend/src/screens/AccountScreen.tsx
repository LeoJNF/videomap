import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppScreen } from '../components/common/AppScreen';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { SectionTitle } from '../components/common/SectionTitle';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { ativarLembretesVideomap, desativarLembretesVideomap, lembretesVideomapAtivos } from '../services/pushNotifications';
import { colors, shadows } from '../theme/tokens';
import { formatDateTime, formatExperienceLevelLabel, formatLeadDate, formatLeadStatusLabel } from '../utils/format';

function profileCompletion(currentProvider: any) {
  if (!currentProvider) return 0;
  const checks = [
    currentProvider.bio,
    currentProvider.avatarUrl,
    currentProvider.contact.whatsapp,
    currentProvider.location,
    currentProvider.specialties.length > 0,
    currentProvider.projects.length > 0,
  ];

  const score = checks.filter(Boolean).length / checks.length;
  return Math.round(score * 100);
}

export default function AccountScreen({ navigation }: any) {
  const { signedIn, currentProvider, currentProviderLeads, favoriteProviderIds, signOut, suggestions } = useMarketplace();
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderFeedback, setReminderFeedback] = useState('');

  useEffect(() => {
    lembretesVideomapAtivos().then(setRemindersEnabled).catch(() => undefined);
  }, []);

  const completion = useMemo(() => profileCompletion(currentProvider), [currentProvider]);
  const recentLeads = currentProviderLeads.slice(0, 3);

  async function handleReminderToggle() {
    if (!currentProvider) return;

    if (remindersEnabled) {
      await desativarLembretesVideomap();
      setRemindersEnabled(false);
      setReminderFeedback('Lembretes do VideoMap desativados.');
      return;
    }

    const activated = await ativarLembretesVideomap(currentProvider.name);
    setRemindersEnabled(activated);
    setReminderFeedback(
      activated
        ? 'Lembretes do VideoMap ativados para manter seu perfil em movimento.'
        : 'Nao foi possivel ativar os lembretes agora.',
    );
  }

  if (!signedIn || !currentProvider) {
    return (
      <AppScreen scroll>
        <ScreenHeader title="Area Pro" subtitle="seu perfil profissional no VideoMap" />

        <View style={styles.guestProfileShell}>
          <View style={styles.guestTopRow}>
            <View style={styles.guestAvatarWrap}>
              <Ionicons name="camera-outline" size={34} color={colors.accentStrong} />
            </View>
            <View style={styles.guestStatsRow}>
              {[
                { label: 'perfil', value: 'ativo' },
                { label: 'propostas', value: 'novas' },
                { label: 'favoritos', value: String(favoriteProviderIds.length) },
              ].map((item) => (
                <View key={item.label} style={styles.guestStatItem}>
                  <Text style={styles.guestStatValue}>{item.value}</Text>
                  <Text style={styles.guestStatLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.guestName}>Sua area profissional no VideoMap</Text>
          <Text style={styles.guestHeadline}>Entre para publicar trabalhos, receber propostas e apresentar seu trabalho com mais presenca.</Text>
          <Text style={styles.guestBio}>Clientes navegam sem atrito. Voce aparece com avatar, numeros, videos e contato direto para orcamento.</Text>

          <View style={styles.guestButtonRow}>
            <TouchableOpacity style={styles.guestPrimaryButton} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.guestPrimaryButtonText}>Entrar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.guestSecondaryButton} onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.guestSecondaryButtonText}>Criar perfil</Text>
            </TouchableOpacity>
          </View>
        </View>

        <SectionTitle
          eyebrow="Area Pro"
          title="O que voce libera aqui"
          description="Menos atrito para vender, responder e evoluir seu perfil no app."
        />

        {[
          'Avatar, bio, especialidades e trabalhos em formato de vitrine.',
          'Propostas organizadas por etapa para responder com mais rapidez.',
          'Metricas, lembretes e canal direto para sugerir melhorias no VideoMap.',
        ].map((item) => (
          <View key={item} style={styles.featureCard}>
            <Ionicons name="checkmark-circle" size={18} color={colors.accentStrong} />
            <Text style={styles.featureText}>{item}</Text>
          </View>
        ))}
      </AppScreen>
    );
  }

  const profileHandle = currentProvider.contact.instagram || `@${currentProvider.name.toLowerCase().replace(/\s+/g, '')}`;

  const statItems = [
    { label: 'projetos', value: String(currentProvider.projects.length) },
    { label: 'propostas', value: String(currentProviderLeads.length) },
    { label: 'perfil %', value: `${completion}%` },
  ];

  const highlightItems = [
    {
      label: 'visitas perfil',
      value: String(currentProvider.metrics.profileViews),
      icon: 'eye-outline' as const,
    },
    {
      label: 'visitas trabalhos',
      value: String(currentProvider.metrics.portfolioViews),
      icon: 'images-outline' as const,
    },
    {
      label: 'propostas novas',
      value: String(currentProviderLeads.filter((lead) => lead.status === 'new').length),
      icon: 'mail-unread-outline' as const,
    },
  ];

  return (
    <AppScreen scroll>
      <ScreenHeader
        title={profileHandle}
        subtitle="area do videomaker"
        rightAction={
          <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
            <Ionicons name="log-out-outline" size={18} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <View style={styles.profileShell}>
        <View style={styles.topRow}>
          <Image source={{ uri: currentProvider.avatarUrl }} style={styles.avatar} />
          <View style={styles.statsRow}>
            {statItems.map((item) => (
              <View key={item.label} style={styles.statItem}>
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.displayName}>{currentProvider.name}</Text>
        <Text style={styles.headline}>{currentProvider.headline}</Text>
        <Text style={styles.bio}>{currentProvider.bio}</Text>

        <View style={styles.metaWrap}>
          <View style={styles.metaBadge}>
            <Ionicons name="location-outline" size={14} color={colors.accentStrong} />
            <Text style={styles.metaBadgeText}>{currentProvider.location}</Text>
          </View>
          <View style={styles.metaBadge}>
            <Ionicons name="ribbon-outline" size={14} color={colors.accentStrong} />
            <Text style={styles.metaBadgeText}>{formatExperienceLevelLabel(currentProvider.experienceLevel)}</Text>
          </View>
          <View style={styles.metaBadge}>
            <Ionicons name="sparkles-outline" size={14} color={colors.accentStrong} />
            <Text style={styles.metaBadgeText}>{currentProvider.availabilityLabel}</Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('EditProfile')}>
            <Text style={styles.primaryButtonText}>Editar perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButtonWide} onPress={() => navigation.navigate('NewService')}>
            <Text style={styles.secondaryButtonWideText}>Novo projeto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButtonWide} onPress={() => navigation.navigate('LeadsManagement')}>
            <Text style={styles.secondaryButtonWideText}>Propostas</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionPillsRow}>
          <TouchableOpacity style={styles.actionPill} onPress={() => navigation.navigate('AnalyticsDashboard')}>
            <Ionicons name="stats-chart-outline" size={15} color={colors.accentStrong} />
            <Text style={styles.actionPillText}>Metricas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionPill} onPress={() => navigation.navigate('PremiumUpgrade')}>
            <Ionicons name="flash-outline" size={15} color={colors.accentStrong} />
            <Text style={styles.actionPillText}>{currentProvider.isPro ? 'Plano Pro ativo' : 'Ativar Plano Pro'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionPill} onPress={() => navigation.navigate('Suggestions')}>
            <Ionicons name="chatbox-ellipses-outline" size={15} color={colors.accentStrong} />
            <Text style={styles.actionPillText}>Sugestoes</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.highlightsScroller}>
        <View style={styles.highlightsRow}>
          {highlightItems.map((item) => (
            <View key={item.label} style={styles.highlightBubble}>
              <Ionicons name={item.icon} size={18} color={colors.accentStrong} />
              <Text style={styles.highlightLabel}>{item.label}</Text>
              <Text style={styles.highlightValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.reminderCard}>
        <View style={styles.reminderHeader}>
          <View style={styles.reminderIconWrap}>
            <Text style={styles.reminderEmoji}>📣</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.reminderTitle}>Lembretes do VideoMap</Text>
            <Text style={styles.reminderText}>Ative mensagens para nao deixar seu perfil parado e lembrar de responder propostas.</Text>
          </View>
        </View>
        {reminderFeedback ? <Text style={styles.reminderFeedback}>{reminderFeedback}</Text> : null}
        <TouchableOpacity style={styles.reminderButton} onPress={handleReminderToggle}>
          <Text style={styles.reminderButtonText}>{remindersEnabled ? 'Desativar lembretes' : 'Ativar lembretes'}</Text>
        </TouchableOpacity>
      </View>

      <SectionTitle
        eyebrow="Propostas"
        title="Propostas recentes"
        description="Os contatos mais frescos para voce manter o timing comercial."
      />

      {recentLeads.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Ainda sem propostas novas por aqui.</Text>
          <Text style={styles.emptyText}>Quando clientes enviarem pedidos, eles vao aparecer aqui em formato de caixa de entrada rapida.</Text>
        </View>
      ) : (
        recentLeads.map((lead) => (
          <View key={lead.id} style={styles.leadCard}>
            <View style={styles.leadHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.leadName}>{lead.clientName}</Text>
                <Text style={styles.leadMeta}>{formatLeadDate(lead.createdAt)}</Text>
              </View>
              <View style={styles.leadBadge}>
                <Text style={styles.leadBadgeText}>{formatLeadStatusLabel(lead.status)}</Text>
              </View>
            </View>
            <Text style={styles.leadBrief} numberOfLines={3}>{lead.brief}</Text>
            <Text style={styles.leadContact}>{lead.clientPhone || lead.clientEmail || 'contato no app'}</Text>
          </View>
        ))
      )}

      <SectionTitle
        eyebrow="Sugestoes"
        title="Melhorias enviadas"
        description="Ideias mandadas por voce para evoluir o app."
      />

      {suggestions.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Nenhuma sugestao enviada ainda.</Text>
          <Text style={styles.emptyText}>Quando voce mandar melhorias pelo app, elas aparecem aqui para acompanhamento.</Text>
        </View>
      ) : (
        suggestions.slice(0, 2).map((item) => (
          <View key={item.id} style={styles.suggestionCard}>
            <Text style={styles.suggestionTitle}>{item.title}</Text>
            <Text style={styles.suggestionMeta}>{item.category} · {formatDateTime(item.createdAt)}</Text>
            <Text style={styles.suggestionText}>{item.message}</Text>
          </View>
        ))
      )}

      <SectionTitle
        eyebrow="Trabalhos"
        title="Projetos publicados"
        description="Cases que ajudam a vender o seu estilo para novos clientes."
      />

      <View style={styles.gridHeader}>
        <Text style={styles.gridHint}>{currentProvider.projects.length} projetos publicados</Text>
      </View>

      {currentProvider.projects.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Seus trabalhos ainda nao apareceram por aqui.</Text>
          <Text style={styles.emptyText}>Publique o primeiro projeto para transformar sua area profissional numa vitrine real.</Text>
        </View>
      ) : (
        <View style={styles.projectGrid}>
          {currentProvider.projects.map((project, index) => (
            <TouchableOpacity
              key={project.id}
              style={styles.projectTile}
              onPress={() => navigation.navigate('Details', { providerId: currentProvider.id, projectId: project.id })}
              activeOpacity={0.9}
            >
              <Image source={{ uri: project.coverUrl }} style={styles.projectImage} />
              <View style={styles.projectTopBadges}>
                {project.videoUrl ? (
                  <View style={styles.projectIconBadge}>
                    <Ionicons name="play" size={12} color={colors.white} />
                  </View>
                ) : null}
                {project.featured || index === 0 ? (
                  <View style={styles.projectIconBadge}>
                    <Ionicons name="sparkles" size={12} color={colors.white} />
                  </View>
                ) : null}
              </View>
              <View style={styles.projectOverlay}>
                <Text style={styles.projectTitle} numberOfLines={2}>{project.title}</Text>
                <Text style={styles.projectMeta}>{project.category}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  guestProfileShell: {
    borderRadius: 28,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    ...shadows.card,
  },
  guestTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  guestAvatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  guestStatsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  guestStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  guestStatValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  guestStatLabel: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  guestName: {
    marginTop: 18,
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  guestHeadline: {
    marginTop: 6,
    color: colors.text,
    fontWeight: '700',
    lineHeight: 20,
  },
  guestBio: {
    marginTop: 10,
    color: colors.textMuted,
    lineHeight: 22,
  },
  guestButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  guestPrimaryButton: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: colors.accentStrong,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  guestPrimaryButtonText: {
    color: colors.white,
    fontWeight: '800',
  },
  guestSecondaryButton: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  guestSecondaryButtonText: {
    color: colors.text,
    fontWeight: '800',
  },
  featureCard: {
    marginBottom: 12,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    flex: 1,
    color: colors.text,
    lineHeight: 20,
    fontWeight: '600',
  },
  signOutButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  profileShell: {
    borderRadius: 28,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    ...shadows.card,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  displayName: {
    marginTop: 18,
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  headline: {
    marginTop: 6,
    color: colors.text,
    fontWeight: '700',
    lineHeight: 20,
  },
  bio: {
    marginTop: 10,
    color: colors.textMuted,
    lineHeight: 22,
  },
  metaWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  metaBadgeText: {
    color: colors.textMuted,
    fontWeight: '700',
  },
  buttonRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: colors.accentStrong,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 14,
  },
  secondaryButtonWide: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  secondaryButtonWideText: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 13,
  },
  actionPillsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    flexWrap: 'wrap',
  },
  actionPill: {
    minWidth: '31%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  actionPillText: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 12,
  },
  highlightsScroller: {
    marginTop: 18,
    marginBottom: 8,
  },
  highlightsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 6,
  },
  highlightBubble: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    ...shadows.soft,
  },
  highlightLabel: {
    marginTop: 8,
    color: colors.textSoft,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  highlightValue: {
    marginTop: 4,
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  reminderCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 20,
  },
  reminderHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  reminderIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
  },
  reminderEmoji: {
    fontSize: 22,
  },
  reminderTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 18,
  },
  reminderText: {
    marginTop: 4,
    color: colors.textMuted,
    lineHeight: 20,
  },
  reminderFeedback: {
    marginTop: 12,
    color: colors.accentStrong,
    fontWeight: '700',
  },
  reminderButton: {
    marginTop: 14,
    borderRadius: 16,
    backgroundColor: colors.accentStrong,
    paddingVertical: 14,
    alignItems: 'center',
  },
  reminderButtonText: {
    color: colors.white,
    fontWeight: '800',
  },
  leadCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 12,
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  leadName: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 17,
  },
  leadMeta: {
    marginTop: 4,
    color: colors.textSoft,
    fontWeight: '700',
    fontSize: 12,
  },
  leadBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.accentSoft,
    alignSelf: 'flex-start',
  },
  leadBadgeText: {
    color: colors.accentStrong,
    fontWeight: '900',
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  leadBrief: {
    marginTop: 10,
    color: colors.textMuted,
    lineHeight: 20,
  },
  leadContact: {
    marginTop: 12,
    color: colors.text,
    fontWeight: '700',
  },
  suggestionCard: {
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  suggestionTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 17,
  },
  suggestionMeta: {
    marginTop: 6,
    color: colors.textSoft,
    fontWeight: '700',
    fontSize: 12,
  },
  suggestionText: {
    marginTop: 8,
    color: colors.textMuted,
    lineHeight: 20,
  },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  gridHint: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 18,
  },
  emptyTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 18,
  },
  emptyText: {
    marginTop: 8,
    color: colors.textMuted,
    lineHeight: 20,
  },
  projectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    marginBottom: 28,
  },
  projectTile: {
    width: '31.7%',
    aspectRatio: 1,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.surfaceStrong,
    position: 'relative',
  },
  projectImage: {
    width: '100%',
    height: '100%',
  },
  projectTopBadges: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  projectIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.58)',
  },
  projectOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.58)',
  },
  projectTitle: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
  },
  projectMeta: {
    marginTop: 3,
    color: 'rgba(255,255,255,0.74)',
    fontSize: 10,
    fontWeight: '700',
  },
});
