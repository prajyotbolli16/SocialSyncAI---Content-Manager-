import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  DarkTheme as NavigationDarkTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';
import { BottomTabs } from './src/navigation/BottomTabs';
import { AuthScreen } from './src/screens/AuthScreen';
import { DarkTheme } from './src/theme/customTheme';
import {
  getSupabaseClient,
  isSupabaseConfigured,
} from './src/services/supabaseClient';
import { notificationService } from './src/services/notificationService';
import { useStore } from './src/store/useStore';
import type { RootStackParamList } from './src/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: DarkTheme.colors.primary,
    background: DarkTheme.colors.background,
    card: DarkTheme.colors.surface,
    text: DarkTheme.colors.onSurface,
    border: DarkTheme.colors.outline,
  },
};

export default function App() {
  const setSession = useStore((state) => state.setSession);

  useEffect(() => {
    // Request notification permissions for scheduled reminders
    void notificationService.requestPermissions();

    if (!isSupabaseConfigured) {
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) return;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.warn('Unable to restore Supabase session:', error.message);
        return;
      }
      if (data.session) {
        setSession(data.session);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  return (
    <PaperProvider theme={DarkTheme}>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="Main"
          screenOptions={{
            headerStyle: { backgroundColor: DarkTheme.colors.surface },
            headerTintColor: DarkTheme.colors.onSurface,
            headerTitleStyle: { fontWeight: '700' },
            contentStyle: { backgroundColor: DarkTheme.colors.background },
          }}
        >
          <Stack.Screen
            name="Main"
            component={BottomTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{
              title: 'Authentication',
              presentation: 'modal',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
