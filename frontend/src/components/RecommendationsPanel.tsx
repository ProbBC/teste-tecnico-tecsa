import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme';

interface Props {
  interpretation: string | null;
  recommendations: string[];
}

export function RecommendationsPanel({ interpretation, recommendations }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.headingRow}>
        <Text style={styles.badge}>IA</Text>
        <Text style={styles.heading}>Recomendações para hoje</Text>
      </View>

      {interpretation ? <Text style={styles.interpretation}>{interpretation}</Text> : null}

      <View style={styles.list}>
        {recommendations.map((item, index) => (
          <View key={index} style={styles.item}>
            <View style={styles.number}>
              <Text style={styles.numberText}>{index + 1}</Text>
            </View>
            <Text style={styles.itemText}>{item}</Text>
          </View>
        ))}
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
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing(1) },
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
  heading: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  interpretation: { color: theme.colors.text, fontSize: 14, lineHeight: 20 },
  list: { gap: theme.spacing(1) },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing(1) },
  number: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: { color: theme.colors.primary, fontWeight: '800', fontSize: 13 },
  itemText: { color: theme.colors.text, flex: 1, lineHeight: 20, fontSize: 14 },
});
