import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, shadows } from '../../theme/tokens';

interface MetricCardProps {
  label: string;
  value: string;
  accent?: 'accent' | 'sage' | 'gold';
}

export function MetricCard({ label, value, accent = 'accent' }: MetricCardProps) {
  return (
    <View style={[styles.card, styles[accent]]}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 110,
    borderRadius: 22,
    padding: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  accent: {
    borderTopColor: colors.accent,
    borderTopWidth: 4,
  },
  sage: {
    borderTopColor: colors.sage,
    borderTopWidth: 4,
  },
  gold: {
    borderTopColor: colors.gold,
    borderTopWidth: 4,
  },
  value: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  label: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
});
