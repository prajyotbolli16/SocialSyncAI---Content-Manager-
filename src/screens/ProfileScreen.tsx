import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native';
import { Button, Text, Chip, Card, Divider, Snackbar } from 'react-native-paper';
import {
  Camera,
  BriefcaseBusiness,
  Video,
  Share2,
  Sparkles,
  LogOut,
  Shield,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { MainTabParamList, ProfileNavigationProp } from '../navigation/types';
import { ScreenContainer, screenStyles } from '../components/ScreenContainer';
import { DarkTheme } from '../theme/customTheme';
import { useStore } from '../store/useStore';
import { isSupabaseConfigured, getSupabaseClient } from '../services/supabaseClient';
import type { SocialPlatform } from '../types';

type Props = BottomTabScreenProps<MainTabParamList, 'Profile'> & {
  navigation: ProfileNavigationProp;
};

export function ProfileScreen({ navigation }: Props) {
  const session = useStore((state) => state.session);
  const setSession = useStore((state) => state.setSession);
  const isDemoMode = useStore((state) => state.isDemoMode);
  const setDemoMode = useStore((state) => state.setDemoMode);
  const socialAccounts = useStore((state) => state.socialAccounts);
  const toggleSocialAccount = useStore((state) => state.toggleSocialAccount);

  const [snackbarMsg, setSnackbarMsg] = useState('');

  const platformIcons: Record<SocialPlatform, React.ReactNode> = {
    Instagram: <Camera size={18} color="#E8DDFF" />,
    LinkedIn: <BriefcaseBusiness size={18} color="#70F7DC" />,
    X: <Share2 size={18} color="#83D6CB" />,
    Facebook: <Share2 size={18} color="#70F7DC" />,
    YouTube: <Video size={18} color="#FF6B6B" />,
  };

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of SocialSync?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          if (isSupabaseConfigured) {
            const supabase = getSupabaseClient();
            if (supabase) await supabase.auth.signOut();
          }
          setSession(null);
          setDemoMode(true);
          setSnackbarMsg('Signed out successfully. Demo mode engaged.');
        },
      },
    ]);
  }

  function handleChannelToggle(platform: SocialPlatform, currentlyConnected: boolean) {
    toggleSocialAccount(platform);
    setSnackbarMsg(
      currentlyConnected
        ? `Disconnected ${platform}.`
        : `Connected ${platform} (Simulated Sandbox Active).`,
    );
  }

  return (
    <ScreenContainer
      title="Profile & Integrations"
      subtitle="Connected social channels, credentials & preferences."
    >
      {/* Account Info Card */}
      <View style={screenStyles.card}>
        <Text style={screenStyles.eyebrow}>Workspace Account</Text>
        <Text variant="titleLarge" style={{ color: '#F5F7FA', fontWeight: '800', marginTop: 8 }}>
          {session?.user?.email ?? 'SocialSync Demo User'}
        </Text>
        <Text style={[screenStyles.muted, { marginTop: 4 }]}>
          {session
            ? 'Authenticated with Supabase Cloud'
            : 'Using Demo Environment · Sign in to sync across devices'}
        </Text>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          {session ? (
            <Button
              mode="contained-tonal"
              icon={({ size, color }) => <LogOut size={size} color={color} />}
              onPress={() => void handleSignOut()}
              style={{ borderRadius: 10 }}
              buttonColor={DarkTheme.colors.surfaceVariant}
              textColor={DarkTheme.colors.error}
            >
              Sign Out
            </Button>
          ) : (
            <Button
              mode="contained"
              buttonColor={DarkTheme.colors.primary}
              textColor={DarkTheme.colors.onPrimary}
              onPress={() => navigation.navigate('Auth')}
              style={{ borderRadius: 10 }}
            >
              Sign In / Connect Supabase
            </Button>
          )}
        </View>
      </View>

      {/* Demo Mode Toggle Switch */}
      <View style={[screenStyles.card, { paddingVertical: 14 }]}>
        <View style={screenStyles.row}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} color={DarkTheme.colors.primary} />
              <Text style={{ color: '#F5F7FA', fontWeight: '700', fontSize: 14 }}>
                Demo & Simulation Mode
              </Text>
            </View>
            <Text style={[screenStyles.muted, { fontSize: 12, marginTop: 4 }]}>
              When enabled, publishing and analytics are realistically simulated without real API credentials.
            </Text>
          </View>
          <Switch
            value={isDemoMode}
            onValueChange={(val) => {
              setDemoMode(val);
              setSnackbarMsg(val ? 'Demo Mode active' : 'Live Mode active');
            }}
            thumbColor={isDemoMode ? DarkTheme.colors.primary : '#89929D'}
            trackColor={{ false: DarkTheme.colors.surfaceVariant, true: DarkTheme.colors.primaryContainer }}
          />
        </View>
      </View>

      {/* Social Media Integration Section (Feature 4) */}
      <View style={[screenStyles.row, { marginTop: 12, marginBottom: 12 }]}>
        <View>
          <Text variant="titleMedium" style={{ color: '#F5F7FA', fontWeight: '800' }}>
            Social Media Networks
          </Text>
          <Text style={[screenStyles.muted, { fontSize: 12 }]}>
            Official API adapters ready for OAuth linking
          </Text>
        </View>
      </View>

      <View style={[screenStyles.card, { paddingVertical: 6 }]}>
        {socialAccounts.map((acc, idx) => (
          <View
            key={acc.platform}
            style={[
              screenStyles.row,
              {
                paddingVertical: 12,
                borderBottomColor: DarkTheme.colors.outline,
                borderBottomWidth: idx === socialAccounts.length - 1 ? 0 : 1,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: DarkTheme.colors.surfaceVariant,
                  borderRadius: 10,
                  height: 38,
                  justifyContent: 'center',
                  width: 38,
                }}
              >
                {platformIcons[acc.platform]}
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ color: '#F5F7FA', fontWeight: '700', fontSize: 14 }}>
                    {acc.platform}
                  </Text>
                  {acc.isMock && (
                    <Chip
                      compact
                      textStyle={{ fontSize: 9, color: '#70F7DC', lineHeight: 12 }}
                      style={{ backgroundColor: DarkTheme.colors.primaryContainer, height: 18 }}
                    >
                      Sandbox
                    </Chip>
                  )}
                </View>
                <Text style={[screenStyles.muted, { fontSize: 11, marginTop: 2 }]}>
                  {acc.handle} · {(acc.followers / 1000).toFixed(1)}K followers
                </Text>
              </View>
            </View>

            <Button
              mode={acc.connected ? 'contained-tonal' : 'outlined'}
              compact
              onPress={() => handleChannelToggle(acc.platform, acc.connected)}
              textColor={acc.connected ? '#70F7DC' : '#A4AFBD'}
              style={{
                borderRadius: 8,
                borderColor: DarkTheme.colors.outline,
                backgroundColor: acc.connected ? DarkTheme.colors.primaryContainer : 'transparent',
              }}
            >
              {acc.connected ? 'Connected' : 'Connect'}
            </Button>
          </View>
        ))}
      </View>

      {/* Backend & Security Details */}
      <View style={screenStyles.card}>
        <View style={screenStyles.row}>
          <Text style={screenStyles.eyebrow}>Security Architecture</Text>
          <Shield size={14} color="#70F7DC" />
        </View>
        <Text style={{ color: '#F5F7FA', fontWeight: '700', fontSize: 14, marginTop: 8 }}>
          Client-Side Zero-Secret Guarantee
        </Text>
        <Text style={[screenStyles.muted, { marginTop: 4, lineHeight: 19, fontSize: 12 }]}>
          • Supabase service-role key is strictly isolated in server Edge Functions.{'\n'}
          • Client uses only public anon keys and Expo SecureStore for encrypted token persistence.{'\n'}
          • Social OAuth secrets never enter mobile bundle.
        </Text>
      </View>

      <Snackbar
        visible={Boolean(snackbarMsg)}
        onDismiss={() => setSnackbarMsg('')}
        duration={3000}
        style={{ backgroundColor: DarkTheme.colors.surfaceVariant }}
      >
        <Text style={{ color: '#F5F7FA' }}>{snackbarMsg}</Text>
      </Snackbar>
    </ScreenContainer>
  );
}
