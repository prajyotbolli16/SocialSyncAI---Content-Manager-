import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput, Card, Divider } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Sparkles, ShieldCheck } from 'lucide-react-native';
import { getSupabaseClient, isSupabaseConfigured } from '../services/supabaseClient';
import { useStore } from '../store/useStore';
import type { RootStackParamList } from '../navigation/types';
import { DarkTheme } from '../theme/customTheme';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;

export function AuthScreen({ navigation }: Props) {
  const setSession = useStore((state) => state.setSession);
  const setDemoMode = useStore((state) => state.setDemoMode);

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError('');
    setNotice('');

    if (!email.trim() || !password) {
      setError('Enter your email and password to continue.');
      return;
    }
    if (password.length < 6) {
      setError('Your password must be at least 6 characters.');
      return;
    }

    if (!isSupabaseConfigured) {
      setError(
        'Supabase is not configured yet. You can use Demo Mode below to test all features.',
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase client initialization failed.');
      }

      const result = isSignUp
        ? await supabase.auth.signUp({ email: email.trim(), password })
        : await supabase.auth.signInWithPassword({ email: email.trim(), password });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      if (result.data.session) {
        setSession(result.data.session);
        navigation.navigate('Main');
      } else {
        setNotice('Check your email to confirm your account, then sign in.');
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to complete sign in. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDemoEnter() {
    setDemoMode(true);
    navigation.navigate('Main');
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardView}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>SOCIALSYNC AI</Text>
          <Text variant="headlineMedium" style={styles.title}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </Text>
          <Text style={styles.subtitle}>
            {isSignUp
              ? 'Multi-channel AI publishing, scheduling & fatigue monitoring.'
              : 'Sign in to access your synchronized social command center.'}
          </Text>
        </View>

        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          label="Email"
          mode="outlined"
          onChangeText={setEmail}
          style={styles.input}
          value={email}
        />
        <TextInput
          autoCapitalize="none"
          autoComplete="password"
          label="Password"
          mode="outlined"
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          value={password}
        />

        {error ? <HelperText type="error" visible>{error}</HelperText> : null}
        {notice ? <HelperText type="info" visible>{notice}</HelperText> : null}

        <Button
          disabled={isSubmitting}
          loading={isSubmitting}
          mode="contained"
          onPress={() => void handleSubmit()}
          style={styles.submit}
        >
          {isSignUp ? 'Create account' : 'Sign in'}
        </Button>

        <Button
          onPress={() => {
            setIsSignUp((value) => !value);
            setError('');
            setNotice('');
          }}
          style={styles.switchButton}
          textColor={DarkTheme.colors.onSurfaceVariant}
        >
          {isSignUp
            ? 'Already have an account? Sign in'
            : 'New to SocialSync? Create an account'}
        </Button>

        <View style={styles.dividerRow}>
          <Divider style={{ flex: 1, backgroundColor: DarkTheme.colors.outline }} />
          <Text style={styles.dividerText}>OR EXPLORE</Text>
          <Divider style={{ flex: 1, backgroundColor: DarkTheme.colors.outline }} />
        </View>

        {/* Demo Mode Action Card */}
        <Card style={styles.demoCard}>
          <Card.Content style={styles.demoCardContent}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} color={DarkTheme.colors.primary} />
                <Text style={{ color: '#F5F7FA', fontWeight: '700', fontSize: 14 }}>
                  Instant Demo Mode
                </Text>
              </View>
              <Text style={{ color: DarkTheme.colors.onSurfaceVariant, fontSize: 12, marginTop: 4 }}>
                Explore all 5 tabs with realistic posts, fatigue monitoring, and AI studio.
              </Text>
            </View>
            <Button
              mode="contained-tonal"
              onPress={handleDemoEnter}
              buttonColor={DarkTheme.colors.primaryContainer}
              textColor={DarkTheme.colors.onPrimaryContainer}
              compact
            >
              Enter
            </Button>
          </Card.Content>
        </Card>

        {!isSupabaseConfigured && (
          <View style={styles.statusFooter}>
            <ShieldCheck size={14} color="#83D6CB" />
            <Text style={{ color: '#83D6CB', fontSize: 11 }}>
              Supabase .env optional for testing · Demo active
            </Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: { backgroundColor: DarkTheme.colors.background, flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  header: { marginBottom: 20 },
  eyebrow: {
    color: DarkTheme.colors.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: { color: '#F5F7FA', fontWeight: '800' },
  subtitle: { color: DarkTheme.colors.onSurfaceVariant, lineHeight: 20, marginTop: 6 },
  input: { backgroundColor: DarkTheme.colors.surface, marginBottom: 12 },
  submit: { marginTop: 8, paddingVertical: 4, borderRadius: 12 },
  switchButton: { marginTop: 4 },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 18,
  },
  dividerText: {
    color: DarkTheme.colors.onSurfaceVariant,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginHorizontal: 12,
  },
  demoCard: {
    backgroundColor: '#122629',
    borderColor: '#005144',
    borderWidth: 1,
    borderRadius: 14,
  },
  demoCardContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  statusFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginTop: 20,
  },
});
