import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PortfolioProject } from '../../types/marketplace';
import { colors, shadows } from '../../theme/tokens';

interface PortfolioCardProps {
  project: PortfolioProject;
  onPress: () => void;
  compact?: boolean;
}

export function PortfolioCard({ project, onPress, compact }: PortfolioCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact]}
      onPress={onPress}
      activeOpacity={0.92}
    >
      <Image source={{ uri: project.coverUrl }} style={[styles.cover, compact && styles.coverCompact]} />
      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{project.category}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {project.title}
        </Text>
        <Text style={styles.summary} numberOfLines={compact ? 2 : 3}>
          {project.summary}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{project.location}</Text>
          <Text style={styles.metaText}>{project.year}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 290,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 14,
    ...shadows.soft,
  },
  cardCompact: {
    width: '100%',
    marginRight: 0,
    marginBottom: 14,
  },
  cover: {
    width: '100%',
    height: 190,
  },
  coverCompact: {
    height: 172,
  },
  content: {
    padding: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    color: colors.accentStrong,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 12,
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  summary: {
    color: colors.textMuted,
    lineHeight: 19,
    marginTop: 8,
  },
  metaRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
  },
});
