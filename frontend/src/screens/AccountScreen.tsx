import React, { useMemo } from 'react';
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
import { colors, shadows } from '../theme/tokens';
import { formatLeadDate } from '../utils/format';

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
  const { signedIn, currentProvider, currentProviderLeads, favoriteProviderIds, signOut } = useMarketplace();

  const completion = useMemo(() => profileCompletion(currentProvider), [currentProvider]);
  const recentLeads = currentProviderLeads.slice(0, 3);

  if (!signedIn || !currentProvider) {
    return (
      <AppScreen scroll>
        <ScreenHeader title="Studio" subtitle="seu perfil profissional com clima de social profile" />

        <View style={styles.guestProfileShell}>
          <View style={styles.guestTopRow}>
            <View style={styles.guestAvatarWrap}>
              <Ionicons name="camera-outline" size={34} color={colors.accentStrong} />
            </View>
            <View style={styles.guestStatsRow}>
              {[
                { label: 'perfil', value: 'pro' },
                { label: 'leads', value: 'novos' },
                { label: 'favoritos', value: String(favoriteProviderIds.length) },
              ].map((item) => (
                <View key={item.label} style={styles.guestStatItem}>
                  <Text style={styles.guestStatValue}>{item.value}</Text>
                  <Text style={styles.guestStatLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.guestName}>Seu Studio no VideoMap</Text>
          <Text style={styles.guestHeadline}>Entre para publicar portfolio, receber briefs e apresentar seu trabalho com cara de perfil forte.</Text>
          <Text style={styles.guestBio}>Clientes navegam sem atrito. Voce aparece com avatar, stats, grid de projetos e CTA direto para orcamento.</Text>

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
          eyebrow="Studio"
          title="O que voce libera aqui"
          description="Mesmo clima de perfil social, mas com foco em conversao e gestao de trabalho."
        />

        {[
          'Avatar, bio, especialidades e portfolio em formato de grid.',
          'Briefings organizados por etapa para responder mais rapido.',
          'Analytics e Studio Pro para dar mais peso comercial ao perfil.',
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
    { label: 'posts', value: String(currentProvider.projects.length) },
    { label: 'leads', value: String(currentProviderLeads.length) },
    { label: 'perfil', value: `${completion}%` },
  ];

  const highlightItems = [
    {
      label: 'views perfil',
      value: String(currentProvider.metrics.profileViews),
      icon: 'eye-outline' as const,
    },
    {
      label: 'views portfolio',
      value: String(currentProvider.metrics.portfolioViews),
      icon: 'images-outline' as const,
    },
    {
      label: 'novos leads',
      value: String(currentProviderLeads.filter((lead) => lead.status === 'new').length),
      icon: 'mail-unread-outline' as const,
    },
  ];

  return (
    <AppScreen scroll>
      <ScreenHeader
        title={profileHandle}
        subtitle="aba Studio do videomaker"
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
            <Text style={styles.metaBadgeText}>{currentProvider.experienceLevel}</Text>
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
            <Text style={styles.secondaryButtonWideText}>Leads</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionPillsRow}>
          <TouchableOpacity style={styles.actionPill} onPress={() => navigation.navigate('AnalyticsDashboard')}>
            <Ionicons name="stats-chart-outline" size={15} color={colors.accentStrong} />
            <Text style={styles.actionPillText}>Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionPill} onPress={() => navigation.navigate('PremiumUpgrade')}>
            <Ionicons name="flash-outline" size={15} color={colors.accentStrong} />
            <Text style={styles.actionPillText}>{currentProvider.isPro ? 'Studio Pro ativo' : 'Ativar Studio Pro'}</Text>
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

      <SectionTitle
        eyebrow="Briefings"
        title="Leads recentes"
        description="Os contatos mais frescos para voce manter o timing comercial."
      />

      {recentLeads.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Ainda sem briefs novos por aqui.</Text>
          <Text style={styles.emptyText}>Quando clientes enviarem pedidos, eles vao aparecer aqui em formato de inbox rapido.</Text>
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
                <Text style={styles.leadBadgeText}>{lead.status}</Text>
              </View>
            </View>
            <Text style={styles.leadBrief} numberOfLines={3}>{lead.brief}</Text>
            <Text style={styles.leadContact}>{lead.clientPhone || lead.clientEmail || 'contato no app'}</Text>
          </View>
        ))
      )}

      <SectionTitle
        eyebrow="Portfolio"
        title="Grid do Studio"
        description="Mesmo clima de perfil social, mas com foco em publicar cases que ajudam a vender."
      />

      <View style={styles.gridHeader}>
        <View style={styles.gridTabActive}>
          <Ionicons name="grid-outline" size={16} color={colors.accentStrong} />
          <Text style={styles.gridTabActiveText}>posts</Text>
        </View>
        <Text style={styles.gridHint}>{currentProvider.projects.length} projetos publicados</Text>
      </View>

      {currentProvider.projects.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Seu portfolio ainda esta vazio.</Text>
          <Text style={styles.emptyText}>Publique o primeiro projeto para transformar a aba Studio numa vitrine real.</Text>
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
  },
  actionPill: {
    flex: 1,
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
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  gridTabActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gridTabActiveText: {
    color: colors.text,
    fontWeight: '800',
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 0.6,
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
