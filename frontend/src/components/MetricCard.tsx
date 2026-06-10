import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme';
import type { HealthMetric } from '../types/health';

interface Props {
  metric: HealthMetric;
  highlight?: boolean;
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MetricCard({ metric, highlight = false }: Props) {
  const { biomarkers, interpretation, recommendations } = metric;

  return (
    <View style={[styles.card, highlight && styles.highlight]}>
      <View style={styles.header}>
        <Text style={styles.date}>{formatDate(metric.recorded_at)}</Text>
      </View>

      <View style={styles.stats}>
        <Stat label="Sono" value={`${biomarkers.sleep_hours} h`} />
        <Stat label="Glicose" value={`${biomarkers.glucose_level} mg/dL`} />
        <Stat label="HRV" value={`${biomarkers.heart_rate} ms`} />
      </View>

      {interpretation ? (
        <Text style={styles.interpretation}>{interpretation}</Text>
      ) : null}

      {recommendations.length > 0 ? (
        <View style={styles.recommendations}>
          <Text style={styles.sectionTitle}>Recomendações</Text>
          {recommendations.map((item, index) => (
            <View key={index} style={styles.recommendationRow}>
              <Text style={styles.bullet}>{index + 1}.</Text>
              <Text style={styles.recommendationText}>{item}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius,
    padding: theme.spacing(2),
    gap: theme.spacing(1.5),
  },
  highlight: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  header: { flexDirection: 'row', justifyContent: 'flex-end' },
  date: { color: theme.colors.muted, fontSize: 12 },
  stats: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  statLabel: { color: theme.colors.muted, fontSize: 12, marginTop: 2 },
  interpretation: { color: theme.colors.text, fontSize: 14, lineHeight: 20 },
  recommendations: { gap: 6 },
  sectionTitle: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recommendationRow: { flexDirection: 'row', gap: 8 },
  bullet: { color: theme.colors.primary, fontWeight: '700' },
  recommendationText: { color: theme.colors.text, flex: 1, lineHeight: 20 },
});
