import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme';
import type { Biomarkers } from '../types/health';

interface TileConfig {
  key: keyof Biomarkers;
  icon: string;
  label: string;
  unit: string;
  /** Display range used to size the proportional bar. */
  min: number;
  max: number;
  status: (value: number) => { text: string; color: string };
}

const NEUTRAL = theme.colors.muted;
const GOOD = '#34d399';
const WARN = '#fbbf24';
const HIGH = '#f87171';

const TILES: TileConfig[] = [
  {
    key: 'sleep_hours',
    icon: '😴',
    label: 'Sono',
    unit: 'h',
    min: 0,
    max: 12,
    status: (v) =>
      v < 7
        ? { text: 'pouco', color: WARN }
        : v <= 9
          ? { text: 'ideal', color: GOOD }
          : { text: 'alto', color: WARN },
  },
  {
    key: 'glucose_level',
    icon: '🩸',
    label: 'Glicose',
    unit: 'mg/dL',
    min: 40,
    max: 200,
    status: (v) =>
      v < 70
        ? { text: 'baixa', color: WARN }
        : v <= 99
          ? { text: 'normal', color: GOOD }
          : v <= 125
            ? { text: 'elevada', color: WARN }
            : { text: 'alta', color: HIGH },
  },
  {
    key: 'heart_rate',
    icon: '💓',
    label: 'HRV',
    unit: 'ms',
    min: 0,
    max: 120,
    status: () => ({ text: 'registrado', color: NEUTRAL }),
  },
];

function ratio(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

export function BiomarkerSummary({ biomarkers }: { biomarkers: Biomarkers }) {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Seus dados mais recentes</Text>
      <View style={styles.grid}>
        {TILES.map((tile) => {
          const value = biomarkers[tile.key];
          const status = tile.status(value);
          return (
            <View key={tile.key} style={styles.tile}>
              <Text style={styles.icon}>{tile.icon}</Text>
              <Text style={styles.value}>
                {value}
                <Text style={styles.unit}> {tile.unit}</Text>
              </Text>
              <Text style={styles.label}>{tile.label}</Text>
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${ratio(value, tile.min, tile.max) * 100}%`,
                      backgroundColor: status.color,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.status, { color: status.color }]}>{status.text}</Text>
            </View>
          );
        })}
      </View>
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
  heading: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  grid: { flexDirection: 'row', gap: theme.spacing(1) },
  tile: {
    flex: 1,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: 12,
    padding: theme.spacing(1.25),
    gap: 4,
    alignItems: 'center',
  },
  icon: { fontSize: 20 },
  value: { color: theme.colors.text, fontSize: 18, fontWeight: '800' },
  unit: { color: theme.colors.muted, fontSize: 11, fontWeight: '600' },
  label: { color: theme.colors.muted, fontSize: 12 },
  track: {
    height: 5,
    width: '100%',
    borderRadius: 3,
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
    marginTop: 2,
  },
  fill: { height: '100%', borderRadius: 3 },
  status: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
});
