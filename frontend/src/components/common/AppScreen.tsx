import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { colors } from '../../theme/tokens';

interface AppScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function AppScreen({
  children,
  scroll,
  style,
  contentContainerStyle,
}: AppScreenProps) {
  if (scroll) {
    return (
      <SafeAreaView style={[styles.safe, style]}>
        <View style={styles.backgroundShapes} pointerEvents="none">
          <View style={[styles.shape, styles.shapePrimary]} />
          <View style={[styles.shape, styles.shapeSecondary]} />
          <View style={[styles.shape, styles.shapeTertiary]} />
        </View>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, style]}>
      <View style={styles.backgroundShapes} pointerEvents="none">
        <View style={[styles.shape, styles.shapePrimary]} />
        <View style={[styles.shape, styles.shapeSecondary]} />
        <View style={[styles.shape, styles.shapeTertiary]} />
      </View>
      <View style={[styles.content, contentContainerStyle]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  backgroundShapes: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  shape: {
    position: 'absolute',
    borderRadius: 999,
  },
  shapePrimary: {
    width: 320,
    height: 320,
    backgroundColor: 'rgba(92, 173, 255, 0.28)',
    top: -120,
    left: -60,
  },
  shapeSecondary: {
    width: 300,
    height: 300,
    backgroundColor: 'rgba(46, 100, 255, 0.18)',
    top: 170,
    right: -110,
  },
  shapeTertiary: {
    width: 260,
    height: 260,
    backgroundColor: 'rgba(255, 122, 38, 0.18)',
    bottom: 80,
    right: -90,
  },
});
