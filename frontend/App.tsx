import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AuthScreen } from './src/screens/AuthScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { MealPlanScreen } from './src/screens/MealPlanScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { theme } from './src/theme';

type Screen = 'dashboard' | 'profile' | 'mealPlan';

function AuthedApp() {
  const [screen, setScreen] = useState<Screen>('dashboard');

  if (screen === 'profile') {
    return <ProfileScreen onBack={() => setScreen('dashboard')} />;
  }

  if (screen === 'mealPlan') {
    return <MealPlanScreen onBack={() => setScreen('dashboard')} />;
  }

  return (
    <DashboardScreen
      onOpenProfile={() => setScreen('profile')}
      onOpenMealPlan={() => setScreen('mealPlan')}
    />
  );
}

function Root() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  return user ? <AuthedApp /> : <AuthScreen />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AuthProvider>
        <Root />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
