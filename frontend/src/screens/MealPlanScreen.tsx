import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { generateMealPlan } from '../api/mealPlan';
import { ApiError } from '../api/client';
import { theme } from '../theme';
import type { MealPlan } from '../types/mealPlan';

export function MealPlanScreen({ onBack }: { onBack: () => void }) {
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      setPlan(await generateMealPlan());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Não foi possível gerar o plano.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={onBack} style={styles.back}>
            <Text style={styles.backText}>‹ Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Plano alimentar</Text>
        </View>

        <Text style={styles.intro}>
          Gere um plano de um dia, personalizado pela IA a partir do seu perfil e dos seus
          biomarcadores mais recentes.
        </Text>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.primaryText} />
          ) : (
            <Text style={styles.buttonText}>{plan ? 'Gerar outro plano' : 'Gerar plano'}</Text>
          )}
        </TouchableOpacity>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {plan ? (
          <View style={styles.result}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Text style={styles.badge}>IA</Text>
                {plan.daily_calories ? (
                  <Text style={styles.calories}>{plan.daily_calories} kcal/dia</Text>
                ) : null}
              </View>
              <Text style={styles.summaryText}>{plan.summary}</Text>
            </View>

            {plan.meals.map((meal, index) => (
              <View key={index} style={styles.mealCard}>
                <View style={styles.mealHeader}>
                  <Text style={styles.mealType}>{meal.type}</Text>
                  {meal.kcal ? <Text style={styles.mealKcal}>{meal.kcal} kcal</Text> : null}
                </View>
                {meal.items.map((item, i) => (
                  <Text key={i} style={styles.mealItem}>
                    • {item}
                  </Text>
                ))}
              </View>
            ))}

            {plan.notes ? <Text style={styles.notes}>{plan.notes}</Text> : null}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    padding: theme.spacing(2),
    paddingBottom: theme.spacing(6),
    gap: theme.spacing(2),
    width: '100%',
    maxWidth: theme.maxContentWidth,
    alignSelf: 'center',
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing(1.5) },
  back: { paddingVertical: 4, paddingRight: 4 },
  backText: { color: theme.colors.primary, fontSize: 16, fontWeight: '700' },
  title: { color: theme.colors.text, fontSize: 22, fontWeight: '800' },
  intro: { color: theme.colors.muted, fontSize: 14, lineHeight: 20 },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: theme.spacing(1.5),
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: theme.colors.primaryText, fontWeight: '700', fontSize: 16 },
  error: { color: theme.colors.danger, fontSize: 14 },
  result: { gap: theme.spacing(1.5) },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius,
    padding: theme.spacing(2),
    gap: theme.spacing(1),
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.primaryText,
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  calories: { color: theme.colors.primary, fontWeight: '700', fontSize: 13 },
  summaryText: { color: theme.colors.text, fontSize: 14, lineHeight: 20 },
  mealCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius,
    padding: theme.spacing(2),
    gap: 6,
  },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mealType: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  mealKcal: { color: theme.colors.muted, fontSize: 12 },
  mealItem: { color: theme.colors.text, fontSize: 14, lineHeight: 20 },
  notes: { color: theme.colors.muted, fontSize: 12, fontStyle: 'italic', lineHeight: 18 },
});
