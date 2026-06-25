import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { OptionGroup } from '@/components/OptionGroup';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Accent, Spacing } from '@/constants/theme';
import {
  ACTIVITY_OPTIONS,
  GOAL_OPTIONS,
  SEX_OPTIONS,
} from '@/constants/labels';
import { getProfile, upsertProfile } from '@/db/repositories/profileRepo';
import { useTheme } from '@/hooks/use-theme';
import { computeTargets, DEFAULT_SPLIT } from '@/services/nutrition';
import { useDayStore } from '@/store/useDayStore';
import type { ActivityLevel, Goal, Profile, Sex } from '@/types/domain';

function parseNumber(text: string): number {
  const parsed = Number.parseFloat(text.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function ProfileScreen() {
  const theme = useTheme();
  const loadDay = useDayStore((state) => state.loadDay);

  const [sex, setSex] = useState<Sex>('male');
  const [age, setAge] = useState('30');
  const [heightCm, setHeightCm] = useState('178');
  const [weightKg, setWeightKg] = useState('75');
  const [activityLevel, setActivityLevel] =
    useState<ActivityLevel>('moderate');
  const [goal, setGoal] = useState<Goal>('maintain');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getProfile().then((stored) => {
      if (!stored) {
        return;
      }
      const p = stored.profile;
      setSex(p.sex);
      setAge(String(p.age));
      setHeightCm(String(p.heightCm));
      setWeightKg(String(p.weightKg));
      setActivityLevel(p.activityLevel);
      setGoal(p.goal);
    });
  }, []);

  const profile: Profile = useMemo(
    () => ({
      sex,
      age: Math.round(parseNumber(age)),
      heightCm: parseNumber(heightCm),
      weightKg: parseNumber(weightKg),
      activityLevel,
      goal,
      split: DEFAULT_SPLIT,
    }),
    [sex, age, heightCm, weightKg, activityLevel, goal],
  );

  const targets = useMemo(() => computeTargets(profile), [profile]);

  const onSave = async () => {
    await upsertProfile(profile, targets);
    await loadDay();
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <OptionGroup
          label="Sexe"
          options={SEX_OPTIONS}
          value={sex}
          onChange={setSex}
        />

        <View style={styles.fieldRow}>
          <LabeledField
            label="Age"
            value={age}
            onChange={setAge}
            suffix="ans"
          />
          <LabeledField
            label="Taille"
            value={heightCm}
            onChange={setHeightCm}
            suffix="cm"
          />
          <LabeledField
            label="Poids"
            value={weightKg}
            onChange={setWeightKg}
            suffix="kg"
          />
        </View>

        <OptionGroup
          label="Niveau d'activite"
          options={ACTIVITY_OPTIONS}
          value={activityLevel}
          onChange={setActivityLevel}
        />

        <OptionGroup
          label="Objectif"
          options={GOAL_OPTIONS}
          value={goal}
          onChange={setGoal}
        />

        <ThemedView type="backgroundElement" style={styles.results}>
          <ResultRow label="BMR" value={`${targets.bmr} kcal`} />
          <ResultRow label="TDEE" value={`${targets.tdee} kcal`} />
          <ResultRow
            label="Objectif"
            value={`${targets.targetKcal} kcal/jour`}
            highlight
          />
          <View style={styles.divider} />
          <ResultRow
            label="Proteines"
            value={`${targets.macros.proteinG} g`}
          />
          <ResultRow label="Glucides" value={`${targets.macros.carbG} g`} />
          <ResultRow label="Lipides" value={`${targets.macros.fatG} g`} />
        </ThemedView>

        <Pressable
          onPress={onSave}
          style={[styles.saveButton, { backgroundColor: Accent.primary }]}>
          <ThemedText type="smallBold" style={{ color: '#ffffff' }}>
            {saved ? 'Enregistre' : 'Enregistrer le profil'}
          </ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

function LabeledField({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (text: string) => void;
  suffix: string;
}) {
  const theme = useTheme();
  return (
    <View style={styles.field}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <View
        style={[
          styles.fieldInput,
          { backgroundColor: theme.backgroundElement },
        ]}>
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          style={[styles.input, { color: theme.text }]}
          selectionColor={Accent.primary}
        />
        <ThemedText type="small" themeColor="textSecondary">
          {suffix}
        </ThemedText>
      </View>
    </View>
  );
}

function ResultRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.resultRow}>
      <ThemedText type={highlight ? 'smallBold' : 'small'}>{label}</ThemedText>
      <ThemedText
        type={highlight ? 'smallBold' : 'small'}
        style={highlight ? { color: Accent.primary } : undefined}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.four,
    paddingBottom: Spacing.six,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  field: {
    flex: 1,
    gap: Spacing.two,
  },
  fieldInput: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    padding: 0,
  },
  results: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#88888855',
    marginVertical: Spacing.one,
  },
  saveButton: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
