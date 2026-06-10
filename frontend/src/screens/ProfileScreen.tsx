import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';
import type { ValidationErrors } from '../types/health';

export function ProfileScreen({ onBack }: { onBack: () => void }) {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [age, setAge] = useState(user ? String(user.age) : '');
  const [weight, setWeight] = useState(user ? String(user.weight) : '');
  const [height, setHeight] = useState(user ? String(user.height) : '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});

  const handleSave = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    setFieldErrors({});
    try {
      await updateProfile({
        name,
        age: Number(age),
        weight: Number(weight.replace(',', '.')),
        height: Number(height),
      });
      setSuccess(true);
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
        if (e.validationErrors) setFieldErrors(e.validationErrors);
      } else {
        setError('Não foi possível salvar. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.topRow}>
            <TouchableOpacity onPress={onBack} style={styles.back}>
              <Text style={styles.backText}>‹ Voltar</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Meu perfil</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.field}>
              <Text style={styles.label}>E-mail</Text>
              <Text style={styles.readonly}>{user?.email}</Text>
            </View>

            <Field
              label="Nome"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              error={fieldErrors.name?.[0]}
            />
            <Field
              label="Idade"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              error={fieldErrors.age?.[0]}
            />
            <Field
              label="Peso (kg)"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              error={fieldErrors.weight?.[0]}
            />
            <Field
              label="Altura (cm)"
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              error={fieldErrors.height?.[0]}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {success ? <Text style={styles.success}>Perfil atualizado!</Text> : null}

            <TouchableOpacity
              style={[styles.button, submitting && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={theme.colors.primaryText} />
              ) : (
                <Text style={styles.buttonText}>Salvar alterações</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  autoCapitalize?: 'none' | 'words';
  keyboardType?: 'default' | 'numeric';
}

function Field({ label, error, ...inputProps }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={theme.colors.muted}
        {...inputProps}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  flex: { flex: 1 },
  content: {
    padding: theme.spacing(2),
    paddingBottom: theme.spacing(8),
    gap: theme.spacing(2),
    width: '100%',
    maxWidth: theme.maxContentWidth,
    alignSelf: 'center',
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing(1.5) },
  back: { paddingVertical: 4, paddingRight: 4 },
  backText: { color: theme.colors.primary, fontSize: 16, fontWeight: '700' },
  title: { color: theme.colors.text, fontSize: 22, fontWeight: '800' },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius,
    padding: theme.spacing(2),
    gap: theme.spacing(1.5),
  },
  field: { gap: 6 },
  label: { color: theme.colors.muted, fontSize: 13 },
  readonly: { color: theme.colors.text, fontSize: 16, paddingVertical: theme.spacing(1.25) },
  input: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: theme.spacing(1.5),
    paddingVertical: theme.spacing(1.25),
    color: theme.colors.text,
    fontSize: 16,
  },
  fieldError: { color: theme.colors.danger, fontSize: 12 },
  error: { color: theme.colors.danger, fontSize: 14 },
  success: { color: theme.colors.primary, fontSize: 14, fontWeight: '600' },
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
