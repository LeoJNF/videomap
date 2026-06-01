import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProviderProfile } from '../../types/marketplace';
import { colors, shadows } from '../../theme/tokens';
import { formatExperienceLevelLabel } from '../../utils/format';

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
}: ProviderCardProps) {
  const badge = levelBadgeStyle(provider.experienceLevel);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      <View style={styles.contentRow}>
        <Image source={{ uri: provider.avatarUrl }} style={styles.avatar} />

        <View style={styles.identityText}>
          <Text style={styles.name} numberOfLines={1}>
            {provider.name}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={colors.accentStrong} />
            <Text style={styles.locationText} numberOfLines={1}>
              {provider.location}
            </Text>
          </View>
        </View>

        <View style={[styles.levelBadge, badge.container]}>
          <Text style={[styles.levelText, badge.text]}>
            {formatExperienceLevelLabel(provider.experienceLevel)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    padding: 14,
    ...shadows.card,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  identityText: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  locationRow: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    color: colors.textMuted,
    fontWeight: '700',
    flexShrink: 1,
  },
  levelBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
