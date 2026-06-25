import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  padded?: boolean;
}

export function Card({ children, style, padded = true }: CardProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.backgroundElement },
        padded && styles.padded,
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  padded: {
    padding: Spacing.three,
  },
});
