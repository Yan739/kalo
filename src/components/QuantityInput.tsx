import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Accent, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  unit?: string;
}

export function QuantityInput({
  value,
  onChange,
  step = 10,
  unit = 'g',
}: QuantityInputProps) {
  const theme = useTheme();

  const setFromText = (text: string) => {
    const parsed = Number.parseInt(text.replace(/[^0-9]/g, ''), 10);
    onChange(Number.isFinite(parsed) ? parsed : 0);
  };

  const adjust = (delta: number) => {
    onChange(Math.max(0, value + delta));
  };

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => adjust(-step)}
        style={[styles.button, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText type="title">-</ThemedText>
      </Pressable>
      <View
        style={[styles.field, { backgroundColor: theme.backgroundElement }]}>
        <TextInput
          value={String(value)}
          onChangeText={setFromText}
          keyboardType="number-pad"
          style={[styles.input, { color: theme.text }]}
          selectionColor={Accent.primary}
        />
        <ThemedText type="small" themeColor="textSecondary">
          {unit}
        </ThemedText>
      </View>
      <Pressable
        onPress={() => adjust(step)}
        style={[styles.button, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText type="title">+</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    alignSelf: 'stretch',
  },
  button: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  input: {
    fontSize: 22,
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'center',
    padding: 0,
  },
});
