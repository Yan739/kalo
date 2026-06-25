import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

interface StatTileProps {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  value: string;
  label: string;
}

export function StatTile({ icon, color, value, label }: StatTileProps) {
  return (
    <Card style={styles.tile}>
      <View style={[styles.iconWrap, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <ThemedText type="subtitle">{value}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.three,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
});
