import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PremiumBadgeProps {
  size?: 'small' | 'medium' | 'large';
  verified?: boolean;
}

export default function PremiumBadge({ size = 'medium', verified = false }: PremiumBadgeProps) {
  const sizeStyles = {
    small: { fontSize: 10, iconSize: 12, paddingH: 6, paddingV: 2 },
    medium: { fontSize: 12, iconSize: 14, paddingH: 8, paddingV: 3 },
    large: { fontSize: 14, iconSize: 16, paddingH: 10, paddingV: 4 },
  };

  const currentSize = sizeStyles[size];

  if (verified) {
    return (
      <View style={[styles.badge, styles.verifiedBadge, { 
        paddingHorizontal: currentSize.paddingH, 
        paddingVertical: currentSize.paddingV 
      }]}>
        <Ionicons name="checkmark-circle" size={currentSize.iconSize} color="#FFF" />
        <Text style={[styles.badgeText, { fontSize: currentSize.fontSize }]}>Verificado</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, styles.premiumBadge, { 
      paddingHorizontal: currentSize.paddingH, 
      paddingVertical: currentSize.paddingV 
    }]}>
      <Ionicons name="diamond" size={currentSize.iconSize} color="#FFF" />
      <Text style={[styles.badgeText, { fontSize: currentSize.fontSize }]}>Premium</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
  },
  premiumBadge: {
    backgroundColor: '#F97316',
  },
  verifiedBadge: {
    backgroundColor: '#3B82F6',
  },
  badgeText: {
    color: '#FFF',
    fontWeight: '700',
  },
});
