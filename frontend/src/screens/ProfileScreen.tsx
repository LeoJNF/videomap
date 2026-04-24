import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppScreen } from '../components/common/AppScreen';
import { EmptyState } from '../components/common/EmptyState';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { SectionTitle } from '../components/common/SectionTitle';
import { FilterChip } from '../components/common/FilterChip';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { colors, shadows } from '../theme/tokens';
import { formatCurrency } from '../utils/format';

function levelBadgeStyle(level: string) {
  if (level === 'PRO') {
    return {
      container: {
        backgroundColor: colors.accentSoft,
        borderColor: colors.accent,
      },
      text: {
        color: colors.accentStrong,
      },
    };
  }

  if (level === 'Intermediario') {
    return {
      container: {
        backgroundColor: colors.surfaceStrong,
        borderColor: colors.borderStrong,
      },
      text: {
        color: colors.text,
      },
    };
  }

  return {
    container: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    text: {
      color: colors.textMuted,
    },
  };
}

export default function ProfileScreen({ route, navigation }: any) {
  const { providerId } = route.params;
  const { getProviderById, isFavorite, toggleFavorite, trackProfileView } = useMarketplace();
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const provider = getProviderById(providerId);

  useEffect(() => {
    trackProfileView(providerId);
  }, [providerId, trackProfileView]);

  useEffect(() => {
    setSelectedCategory('Todos');
  }, [providerId]);

  const projects = useMemo(() => provider?.projects || [], [provider]);
  const categoryTabs = useMemo(() => {
    if (!provider) return ['Todos'];

    const orderedTags = [
      ...provider.specialties,
      ...projects.map((project) => project.category),
    ];

    return ['Todos', ...Array.from(new Set(orderedTags))];
  }, [projects, provider]);
  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'Todos') return projects;
    return projects.filter((project) => project.category === selectedCategory);
  }, [projects, selectedCategory]);

  useEffect(() => {
    if (!categoryTabs.includes(selectedCategory)) {
      setSelectedCategory('Todos');
    }
  }, [categoryTabs, selectedCategory]);

  if (!provider) {
    return (
      <AppScreen scroll>
        <ScreenHeader title="Videomaker" onBack={() => navigation.goBack()} />
        <EmptyState
          title="Perfil nao encontrado"
          description="Esse videomaker pode ter sido removido ou ainda nao publicou portfolio."
        />
      </AppScreen>
    );
  }

  const profileHandle =
    provider.contact.instagram || `@${provider.name.toLowerCase().replace(/\s+/g, '')}`;
  const levelBadge = levelBadgeStyle(provider.experienceLevel);

  const statItems = [
    { label: 'posts', value: String(projects.length) },
    { label: 'jobs', value: String(provider.completedProjects) },
    { label: 'avaliacao', value: `${provider.satisfactionRate}%` },
  ];

  const openWhatsApp = () => {
    if (!provider.contact.whatsapp) return;
    const message = encodeURIComponent(
      `Oi, ${provider.name}! Vi seu perfil no VideoMap e queria conversar sobre um projeto.`,
    );
    Linking.openURL(`https://wa.me/${provider.contact.whatsapp}?text=${message}`);
  };

  const openInstagram = () => {
    if (!provider.contact.instagram) return;
    const handle = provider.contact.instagram.replace('@', '');
    Linking.openURL(`https://instagram.com/${handle}`);
  };

  const openWebsite = () => {
    if (!provider.contact.website) return;
    Linking.openURL(provider.contact.website);
  };

  return (
    <AppScreen scroll>
      <ScreenHeader
        title={profileHandle}
        subtitle="perfil do videomaker"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity style={styles.favoriteButton} onPress={() => toggleFavorite(provider.id)}>
            <Ionicons
              name={isFavorite(provider.id) ? 'heart' : 'heart-outline'}
              size={19}
              color={isFavorite(provider.id) ? colors.accentStrong : colors.text}
            />
          </TouchableOpacity>
        }
      />

      <View style={styles.profileShell}>
        <View style={styles.topRow}>
          <Image source={{ uri: provider.avatarUrl }} style={styles.avatar} />
          <View style={styles.statsRow}>
            {statItems.map((item) => (
              <View key={item.label} style={styles.statItem}>
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.nameRow}>
          <Text style={styles.displayName}>{provider.name}</Text>
          <View style={[styles.levelBadge, levelBadge.container]}>
            <Text style={[styles.levelText, levelBadge.text]}>{provider.experienceLevel}</Text>
          </View>
        </View>
        <Text style={styles.headline}>{provider.headline}</Text>
        <Text style={styles.bio}>{provider.bio}</Text>

        <View style={styles.metaWrap}>
          <View style={styles.metaBadge}>
            <Ionicons name="location-outline" size={14} color={colors.accentStrong} />
            <Text style={styles.metaBadgeText}>{provider.location}</Text>
          </View>
          <View style={styles.metaBadge}>
            <Ionicons name="sparkles-outline" size={14} color={colors.accentStrong} />
            <Text style={styles.metaBadgeText}>{provider.availabilityLabel}</Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('LeadForm', { providerId: provider.id })}
          >
            <Text style={styles.primaryButtonText}>Solicitar projeto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={openWhatsApp}>
            <Ionicons name="logo-whatsapp" size={18} color={colors.text} />
          </TouchableOpacity>
          {provider.contact.instagram ? (
            <TouchableOpacity style={styles.secondaryButton} onPress={openInstagram}>
              <Ionicons name="logo-instagram" size={18} color={colors.text} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.quickFactsRow}>
          <View style={styles.quickFactCard}>
            <Ionicons name="wallet-outline" size={16} color={colors.accentStrong} />
            <Text style={styles.quickFactLabel}>A partir de</Text>
            <Text style={styles.quickFactValue}>{formatCurrency(provider.startingPrice)}</Text>
          </View>
          <View style={styles.quickFactCard}>
            <Ionicons name="flash-outline" size={16} color={colors.accentStrong} />
            <Text style={styles.quickFactLabel}>Resposta</Text>
            <Text style={styles.quickFactValue}>{provider.responseTime}</Text>
          </View>
        </View>
      </View>

      <SectionTitle
        eyebrow="Portfolio"
        title="Projetos"
      />

      {categoryTabs.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroller}>
          <View style={styles.tabsRow}>
            {categoryTabs.map((tab) => (
              <FilterChip
                key={tab}
                label={tab}
                active={selectedCategory === tab}
                onPress={() => setSelectedCategory(tab)}
              />
            ))}
          </View>
        </ScrollView>
      ) : null}

      <View style={styles.gridHeader}>
        <Text style={styles.gridHint}>
          {filteredProjects.length} projeto{filteredProjects.length === 1 ? '' : 's'}
        </Text>
      </View>

      {filteredProjects.length === 0 ? (
        <View style={styles.emptyPortfolio}>
          <Text style={styles.emptyPortfolioTitle}>Nenhum projeto nessa area.</Text>
          <Text style={styles.emptyPortfolioText}>
            O videomaker ja marcou essa categoria no perfil, mas ainda nao publicou nenhum trabalho nela.
          </Text>
        </View>
      ) : (
        <View style={styles.projectGrid}>
          {filteredProjects.map((project, index) => (
            <TouchableOpacity
              key={project.id}
              style={styles.projectTile}
              onPress={() =>
                navigation.navigate('Details', {
                  providerId: provider.id,
                  projectId: project.id,
                })
              }
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
                <Text style={styles.projectTitle} numberOfLines={2}>
                  {project.title}
                </Text>
                <Text style={styles.projectMeta}>{project.category}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <SectionTitle
        eyebrow="Contato"
        title="Contato"
      />

      <View style={styles.contactCard}>
        <View style={styles.contactRow}>
          <Text style={styles.contactLabel}>Email</Text>
          <Text style={styles.contactValue}>{provider.contact.email}</Text>
        </View>
        <View style={styles.contactRow}>
          <Text style={styles.contactLabel}>WhatsApp</Text>
          <Text style={styles.contactValue}>{provider.contact.whatsapp}</Text>
        </View>
        {provider.contact.website ? (
          <TouchableOpacity style={styles.contactRow} onPress={openWebsite}>
            <Text style={styles.contactLabel}>Site</Text>
            <Text style={styles.contactLink}>{provider.contact.website}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  favoriteButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
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
  nameRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  displayName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    flex: 1,
  },
  levelBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
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
    fontSize: 15,
  },
  secondaryButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickFactsRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  quickFactCard: {
    flex: 1,
    minHeight: 78,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  quickFactLabel: {
    marginTop: 8,
    color: colors.textSoft,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  quickFactValue: {
    marginTop: 4,
    color: colors.text,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
  },
  tabsScroller: {
    marginBottom: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 4,
  },
  gridHeader: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  gridHint: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyPortfolio: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 26,
  },
  emptyPortfolioTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  emptyPortfolioText: {
    marginTop: 8,
    color: colors.textMuted,
    lineHeight: 20,
  },
  projectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    marginBottom: 24,
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
  contactCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 28,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contactLabel: {
    color: colors.textSoft,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  contactValue: {
    flex: 1,
    textAlign: 'right',
    color: colors.text,
    fontWeight: '700',
  },
  contactLink: {
    flex: 1,
    textAlign: 'right',
    color: colors.accentStrong,
    fontWeight: '700',
  },
});
