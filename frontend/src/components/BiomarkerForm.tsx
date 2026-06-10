import { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { theme } from '../theme';
import type { Biomarkers, ValidationErrors } from '../types/health';

interface Field {
  key: keyof Biomarkers;
  label: string;
  placeholder: string;
  unit: string;
}

const FIELDS: Field[] = [
  { key: 'sleep_hours', label: 'Horas de sono', placeholder: '7.5', unit: 'h' },
  { key: 'glucose_level', label: 'Nível de glicose', placeholder: '95', unit: 'mg/dL' },
  { key: 'heart_rate', label: 'Variabilidade cardíaca (HRV)', placeholder: '62', unit: 'ms' },
];

interface Props {
  submitting: boolean;
  fieldErrors: ValidationErrors;
  onSubmit: (biomarkers: Biomarkers) => void;
}

type FormState = Record<keyof Biomarkers, string>;

const EMPTY: FormState = { sleep_hours: '', glucose_level: '', heart_rate: '' };

export function BiomarkerForm({ submitting, fieldErrors, onSubmit }: Props) {
  const [values, setValues] = useState<FormState>(EMPTY);

  const handleChange = (key: keyof Biomarkers, raw: string) => {
    setValues((current) => ({ ...current, [key]: raw.replace(',', '.') }));
  };

  const handleSubmit = () => {
    onSubmit({
      sleep_hours: Number(values.sleep_hours),
      glucose_level: Number(values.glucose_level),
      heart_rate: Number(values.heart_rate),
    });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Registrar biomarcadores</Text>

      {FIELDS.map((field) => (
        <View key={field.key} style={styles.field}>
          <Text style={styles.label}>{field.label}</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder={field.placeholder}
              placeholderTextColor={theme.colors.muted}
              value={values[field.key]}
              onChangeText={(text) => handleChange(field.key, text)}
            />
            <Text style={styles.unit}>{field.unit}</Text>
          </View>
          {fieldErrors[field.key]?.[0] ? (
            <Text style={styles.error}>{fieldErrors[field.key][0]}</Text>
          ) : null}
        </View>
      ))}

      <TouchableOpacity
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color={theme.colors.primaryText} />
        ) : (
          <Text style={styles.buttonText}>Analisar com IA</Text>
        )}
      </TouchableOpacity>
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
  title: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  field: { gap: 6 },
  label: { color: theme.colors.muted, fontSize: 13 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: theme.spacing(1.5),
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
    paddingVertical: theme.spacing(1.25),
  },
  unit: { color: theme.colors.muted, fontSize: 13 },
  error: { color: theme.colors.danger, fontSize: 12 },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: theme.spacing(1.5),
    alignItems: 'center',
    marginTop: theme.spacing(0.5),
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: theme.colors.primaryText, fontWeight: '700', fontSize: 16 },
});
