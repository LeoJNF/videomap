import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProviderProfile } from '../../types/marketplace';
import { colors, shadows } from '../../theme/tokens';

interface ProviderCardProps {
  provider: ProviderProfile;
  onPress: () => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
}

function levelBadgeStyle(level: ProviderProfile['experienceLevel']) {
  switch (level) {
    case 'PRO':
      return {
        container: {
          backgroundColor: colors.accentSoft,
          borderColor: colors.accent,
        },
        text: {
          color: colors.accentStrong,
        },
      };
    case 'Intermediario':
      return {
        container: {
          backgroundColor: colors.surfaceStrong,
          borderColor: colors.borderStrong,
        },
        text: {
          color: colors.text,
        },
      };
    default:
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
}

export function ProviderCard({
  provider,
  onPress,
  onToggleFavorite,
  isFavorite,
}: ProviderCardProps) {
  const badge = levelBadgeStyle(provider.experienceLevel);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      <View style={styles.headerRow}>
        <View style={styles.identityRow}>
          <Image source={{ uri: provider.avatarUrl }} style={styles.avatar} />
          <View style={styles.identityText}>
            <Text style={styles.name}>{provider.name}</Text>
            <Text style={styles.headline} numberOfLines={2}>
              {provider.headline}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.favoriteButton} onPress={onToggleFavorite}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite ? colors.accentStrong : colors.text}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.locationPill}>
          <Ionicons name="location-outline" size={14} color={colors.accentStrong} />
          <Text style={styles.locationText}>{provider.location}</Text>
        </View>
        <View style={[styles.levelBadge, badge.container]}>
          <Text style={[styles.levelText, badge.text]}>{provider.experienceLevel}</Text>
        </View>
      </View>

      <View style={styles.chipsRow}>
        {provider.specialties.slice(0, 3).map((item) => (
          <View key={item} style={styles.chip}>
            <Text style={styles.chipText}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{provider.responseTime}</Text>
        <Text style={styles.metaDot}>•</Text>
        <Text style={styles.metaText}>{provider.completedProjects} projetos</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    padding: 18,
    ...shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  identityRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  identityText: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  headline: {
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 19,
  },
  favoriteButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'center',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flex: 1,
  },
  locationText: {
    color: colors.text,
    fontWeight: '700',
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
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  chip: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  metaText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '600',
  },
  metaDot: {
    color: colors.textSoft,
  },
});
