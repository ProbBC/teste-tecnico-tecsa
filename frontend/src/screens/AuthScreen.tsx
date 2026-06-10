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

type Mode = 'login' | 'register';

export function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});

  const isRegister = mode === 'register';

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setFieldErrors({});
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      if (isRegister) {
        await signUp({
          name,
          email,
          password,
          age: Number(age),
          weight: Number(weight.replace(',', '.')),
          height: Number(height),
        });
      } else {
        await signIn({ email, password });
      }
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
        if (e.validationErrors) setFieldErrors(e.validationErrors);
      } else {
        setError('Erro inesperado. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Health Dashboard</Text>
            <Text style={styles.subtitle}>
              {isRegister ? 'Crie sua conta para começar.' : 'Entre para acompanhar sua saúde.'}
            </Text>
          </View>

          <View style={styles.tabs}>
            <Tab label="Entrar" active={!isRegister} onPress={() => switchMode('login')} />
            <Tab label="Cadastrar" active={isRegister} onPress={() => switchMode('register')} />
          </View>

          <View style={styles.form}>
            {isRegister ? (
              <>
                <Field
                  label="Nome"
                  value={name}
                  onChangeText={setName}
                  placeholder="Seu nome"
                  autoCapitalize="words"
                  error={fieldErrors.name?.[0]}
                />
                <View style={styles.row}>
                  <View style={styles.rowItem}>
                    <Field
                      label="Idade"
                      value={age}
                      onChangeText={setAge}
                      placeholder="30"
                      keyboardType="numeric"
                      error={fieldErrors.age?.[0]}
                    />
                  </View>
                  <View style={styles.rowItem}>
                    <Field
                      label="Peso (kg)"
                      value={weight}
                      onChangeText={setWeight}
                      placeholder="68.5"
                      keyboardType="numeric"
                      error={fieldErrors.weight?.[0]}
                    />
                  </View>
                  <View style={styles.rowItem}>
                    <Field
                      label="Altura (cm)"
                      value={height}
                      onChangeText={setHeight}
                      placeholder="170"
                      keyboardType="numeric"
                      error={fieldErrors.height?.[0]}
                    />
                  </View>
                </View>
              </>
            ) : null}

            <Field
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              placeholder="voce@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              error={fieldErrors.email?.[0]}
            />

            <Field
              label="Senha"
              value={password}
              onChangeText={setPassword}
              placeholder="Senha"
              secureTextEntry
              error={fieldErrors.password?.[0]}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, submitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={theme.colors.primaryText} />
              ) : (
                <Text style={styles.buttonText}>{isRegister ? 'Criar conta' : 'Entrar'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.tab, active && styles.tabActive]} onPress={onPress}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'words' | 'sentences' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric';
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
    padding: theme.spacing(2.5),
    paddingBottom: theme.spacing(8),
    gap: theme.spacing(3),
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: { gap: 6 },
  title: { color: theme.colors.text, fontSize: 28, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: theme.colors.muted, fontSize: 14, textAlign: 'center' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: theme.spacing(1.25), borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: theme.colors.surfaceAlt },
  tabText: { color: theme.colors.muted, fontWeight: '600' },
  tabTextActive: { color: theme.colors.text },
  form: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius,
    padding: theme.spacing(2),
    gap: theme.spacing(1.5),
  },
  row: { flexDirection: 'row', gap: theme.spacing(1) },
  rowItem: { flex: 1 },
  field: { gap: 6 },
  label: { color: theme.colors.muted, fontSize: 13 },
  input: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: theme.spacing(1.5),
    paddingVertical: theme.spacing(1.25),
    color: theme.colors.text,
    fontSize: 16,
  },
  fieldError: { color: theme.colors.danger, fontSize: 12 },
  error: { color: theme.colors.danger, fontSize: 14, textAlign: 'center' },
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
