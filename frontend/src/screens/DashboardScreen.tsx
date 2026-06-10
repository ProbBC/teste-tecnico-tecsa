import { useMemo } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BiomarkerForm } from '../components/BiomarkerForm';
import { BiomarkerSummary } from '../components/BiomarkerSummary';
import { MetricCard } from '../components/MetricCard';
import { RecommendationsPanel } from '../components/RecommendationsPanel';
import { useAuth } from '../context/AuthContext';
import { useHealthMetrics } from '../hooks/useHealthMetrics';
import { theme } from '../theme';

interface Props {
  onOpenProfile: () => void;
  onOpenMealPlan: () => void;
}

export function DashboardScreen({ onOpenProfile, onOpenMealPlan }: Props) {
  const { user, signOut } = useAuth();
  const { metrics, loading, submitting, error, fieldErrors, refresh, submit } =
    useHealthMetrics();

  const [latest, ...history] = metrics;

  const header = useMemo(
    () => (
      <View style={styles.header}>
        <View style={styles.topRow}>
          <View style={styles.flexShrink}>
            <Text style={styles.title}>Olá, {user?.name?.split(' ')[0] ?? 'usuário'}</Text>
            <Text style={styles.subtitle}>
              Acompanhe seus biomarcadores e receba recomendações geradas por IA.
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.menuButton} onPress={onOpenProfile}>
              <Text style={styles.menuText}>Perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuButton} onPress={() => void signOut()}>
              <Text style={styles.logoutText}>Sair</Text>
            </TouchableOpacity>
          </View>
        </View>

        <BiomarkerForm
          submitting={submitting}
          fieldErrors={fieldErrors}
          onSubmit={(biomarkers) => void submit(biomarkers)}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.mealPlanCta} onPress={onOpenMealPlan}>
          <Text style={styles.mealPlanIcon}>🍽️</Text>
          <View style={styles.flexShrink}>
            <Text style={styles.mealPlanTitle}>Plano alimentar com IA</Text>
            <Text style={styles.mealPlanSubtitle}>
              Gere um plano de um dia a partir do seu perfil e biomarcadores
            </Text>
          </View>
          <Text style={styles.mealPlanChevron}>›</Text>
        </TouchableOpacity>

        {latest ? (
          <View style={styles.latest}>
            <Text style={styles.sectionLabel}>Último registro</Text>
            <BiomarkerSummary biomarkers={latest.biomarkers} />
            <RecommendationsPanel
              interpretation={latest.interpretation}
              recommendations={latest.recommendations}
            />
          </View>
        ) : null}

        {history.length > 0 ? (
          <Text style={styles.sectionLabel}>Histórico</Text>
        ) : null}
      </View>
    ),
    [
      submitting,
      fieldErrors,
      error,
      latest,
      history.length,
      submit,
      user,
      signOut,
      onOpenProfile,
      onOpenMealPlan,
    ],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={history}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <MetricCard metric={item} />}
          ListHeaderComponent={header}
          contentContainerStyle={styles.content}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => void refresh()}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            !loading && !latest ? (
              <Text style={styles.empty}>
                Nenhum registro ainda. Insira seus dados acima para começar.
              </Text>
            ) : null
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  flex: { flex: 1 },
  content: { padding: theme.spacing(2), gap: theme.spacing(1.5) },
  header: { gap: theme.spacing(2) },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
  },
  flexShrink: { flex: 1 },
  headerActions: { flexDirection: 'row', gap: theme.spacing(1) },
  menuButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    paddingHorizontal: theme.spacing(1.5),
    paddingVertical: theme.spacing(1),
  },
  menuText: { color: theme.colors.primary, fontWeight: '700', fontSize: 13 },
  logoutText: { color: theme.colors.danger, fontWeight: '700', fontSize: 13 },
  mealPlanCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius,
    padding: theme.spacing(2),
  },
  mealPlanIcon: { fontSize: 24 },
  mealPlanTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  mealPlanSubtitle: { color: theme.colors.muted, fontSize: 12, marginTop: 2 },
  mealPlanChevron: { color: theme.colors.primary, fontSize: 24, fontWeight: '800' },
  title: { color: theme.colors.text, fontSize: 26, fontWeight: '800' },
  subtitle: { color: theme.colors.muted, fontSize: 14, marginTop: 4 },
  latest: { gap: theme.spacing(1) },
  sectionLabel: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  error: { color: theme.colors.danger, fontSize: 14 },
  empty: {
    color: theme.colors.muted,
    textAlign: 'center',
    marginTop: theme.spacing(2),
  },
  separator: { height: theme.spacing(1.5) },
});
