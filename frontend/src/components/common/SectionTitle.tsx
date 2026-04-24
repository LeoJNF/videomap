import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../../theme/tokens';

interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  description?: string;
  rightSlot?: React.ReactNode;
}

export function SectionTitle({ eyebrow, title, description, rightSlot }: SectionTitleProps) {
  return (
    <View style={styles.row}>
      <View style={styles.textBlock}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      {rightSlot ? <View>{rightSlot}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
    marginBottom: 14,
  },
  textBlock: {
    flex: 1,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: typography.micro,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    fontWeight: '800',
    marginBottom: 5,
  },
  title: {
    color: colors.text,
    fontSize: typography.h3,
    fontWeight: '800',
  },
  description: {
    color: colors.textMuted,
    marginTop: 4,
    fontSize: typography.small,
    lineHeight: 18,
  },
});
