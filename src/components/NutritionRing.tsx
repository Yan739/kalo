import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Accent, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface NutritionRingProps {
  current: number;
  target: number;
  size?: number;
  strokeWidth?: number;
}

export function NutritionRing({
  current,
  target,
  size = 180,
  strokeWidth = 16,
}: NutritionRingProps) {
  const theme = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = target > 0 ? Math.min(current / target, 1) : 0;
  const over = target > 0 && current > target;
  const color = over ? Accent.ringOver : Accent.ring;
  const dashOffset = circumference * (1 - ratio);

  const remaining = Math.round(target - current);
  const remainingLabel = target > 0 ? Math.abs(remaining) : 0;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.backgroundSelected}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center}>
        <ThemedText type="title">{Math.round(current)}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          / {target > 0 ? Math.round(target) : '-'} kcal
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {target > 0
            ? over
              ? `${remainingLabel} au-dessus`
              : `${remainingLabel} restantes`
            : 'objectif non defini'}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.half,
  },
});
