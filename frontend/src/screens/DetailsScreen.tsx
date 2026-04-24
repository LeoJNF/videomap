import React, { useEffect } from 'react';
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { AppScreen } from '../components/common/AppScreen';
import { EmptyState } from '../components/common/EmptyState';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { SectionTitle } from '../components/common/SectionTitle';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { colors, shadows } from '../theme/tokens';

export default function DetailsScreen({ route, navigation }: any) {
  const { providerId, projectId } = route.params;
  const { getProviderById, getProjectById, trackProjectView } = useMarketplace();

  const provider = getProviderById(providerId);
  const project = getProjectById(providerId, projectId);

  useEffect(() => {
    trackProjectView(providerId, projectId);
  }, [projectId, providerId, trackProjectView]);

  if (!provider || !project) {
    return (
      <AppScreen scroll>
        <ScreenHeader title="Projeto" onBack={() => navigation.goBack()} />
        <EmptyState
          title="Projeto nao encontrado"
          description="Esse item do portfolio pode ter sido removido ou atualizado."
        />
      </AppScreen>
    );
  }

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      `Oi, ${provider.name}! Vi o projeto "${project.title}" no VideoMap e gostaria de solicitar algo nesse estilo.`,
    );
    Linking.openURL(`https://wa.me/${provider.contact.whatsapp}?text=${message}`);
  };

  return (
    <AppScreen scroll>
      <ScreenHeader
        title={project.title}
        subtitle={`${project.category} · ${project.location}`}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.mediaCard}>
        {project.videoUrl ? (
          <Video
            style={styles.video}
            source={{ uri: project.videoUrl }}
            resizeMode={ResizeMode.COVER}
            useNativeControls
            shouldPlay={false}
          />
        ) : (
          <Image source={{ uri: project.coverUrl }} style={styles.video} />
        )}
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{project.category}</Text>
        </View>
        <Text style={styles.summaryTitle}>{project.title}</Text>
        <Text style={styles.summaryText}>{project.summary}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>cliente</Text>
            <Text style={styles.metaValue}>{project.clientName || 'Projeto autoral'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>ano</Text>
            <Text style={styles.metaValue}>{project.year}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>entrega</Text>
            <Text style={styles.metaValue}>{project.durationLabel || 'Sob demanda'}</Text>
          </View>
        </View>
      </View>

      <SectionTitle
        eyebrow="Entregaveis"
        title="O que esse projeto incluiu"
        description="Lista pensada para te ajudar a entender escopo e profundidade da producao."
      />

      <View style={styles.listCard}>
        {project.deliverables.map((item) => (
          <View key={item} style={styles.listItem}>
            <Ionicons name="checkmark-circle" size={18} color={colors.sage} />
            <Text style={styles.listText}>{item}</Text>
          </View>
        ))}
      </View>

      <SectionTitle
        eyebrow="Tags"
        title="Linguagem do projeto"
        description="Ajuda a encontrar profissionais com a mesma assinatura visual que voce procura."
      />

      <View style={styles.tagsWrap}>
        {project.tags.map((item) => (
          <View key={item} style={styles.tag}>
            <Text style={styles.tagText}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={styles.providerCard}>
        <View style={styles.providerTop}>
          <Image source={{ uri: provider.avatarUrl }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.providerName}>{provider.name}</Text>
            <Text style={styles.providerMeta}>{provider.location}</Text>
          </View>
        </View>
        <Text style={styles.providerBio}>{provider.headline}</Text>
        <View style={styles.ctaRow}>
          <TouchableOpacity
            style={styles.primaryCta}
            onPress={() => navigation.navigate('LeadForm', { providerId, projectId })}
          >
            <Text style={styles.primaryCtaText}>Solicitar algo nesse estilo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryCta} onPress={openWhatsApp}>
            <Ionicons name="logo-whatsapp" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  mediaCard: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  video: {
    width: '100%',
    height: 260,
    backgroundColor: colors.surfaceDark,
  },
  summaryCard: {
    marginTop: 18,
    padding: 20,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  categoryBadgeText: {
    color: colors.accentStrong,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryTitle: {
    color: colors.white,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    marginTop: 14,
  },
  summaryText: {
    marginTop: 10,
    color: colors.textMuted,
    lineHeight: 22,
  },
  metaRow: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 10,
  },
  metaItem: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaLabel: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  metaValue: {
    marginTop: 8,
    color: colors.white,
    fontWeight: '700',
    lineHeight: 18,
  },
  listCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listText: {
    flex: 1,
    color: colors.white,
    lineHeight: 20,
    fontWeight: '600',
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  tag: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.surfaceStrong,
  },
  tagText: {
    color: colors.textMuted,
    fontWeight: '700',
  },
  providerCard: {
    marginBottom: 24,
    borderRadius: 26,
    backgroundColor: colors.surfaceDark,
    padding: 18,
  },
  providerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  providerName: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 18,
  },
  providerMeta: {
    color: 'rgba(255,255,255,0.74)',
    marginTop: 4,
  },
  providerBio: {
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 21,
    marginTop: 16,
  },
  ctaRow: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 10,
  },
  primaryCta: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: colors.accentStrong,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryCtaText: {
    color: colors.white,
    fontWeight: '800',
  },
  secondaryCta: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
