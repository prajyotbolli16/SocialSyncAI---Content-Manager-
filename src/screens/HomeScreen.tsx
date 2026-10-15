import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Text, Chip, ActivityIndicator, Snackbar } from 'react-native-paper';
import {
  ArrowUpRight,
  CalendarDays,
  Plus,
  Send,
  Zap,
  TrendingUp,
  Camera,
  BriefcaseBusiness,
  Video,
  Share2,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ScreenContainer, screenStyles } from '../components/ScreenContainer';
import { DarkTheme } from '../theme/customTheme';
import { useStore } from '../store/useStore';
import type { MainTabParamList } from '../navigation/types';
import type { SocialPlatform } from '../types';

export function HomeScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  const posts = useStore((state) => state.posts);
  const drafts = useStore((state) => state.drafts);
  const socialAccounts = useStore((state) => state.socialAccounts);
  const publishPostNow = useStore((state) => state.publishPostNow);

  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  // Compute live statistics from store
  const scheduledPosts = posts.filter((p) => p.status === 'scheduled');
  const publishedPosts = posts.filter((p) => p.status === 'published');

  const totalViews = publishedPosts.reduce(
    (acc, p) => acc + (p.stats?.views || 0),
    0,
  );
  const totalEngagements = publishedPosts.reduce(
    (acc, p) => acc + (p.stats ? p.stats.likes + p.stats.comments + p.stats.shares : 0),
    0,
  );
  const avgEngagementRate =
    totalViews > 0 ? ((totalEngagements / totalViews) * 100).toFixed(1) : '4.8';

  async function handleQuickPublish(postId: string) {
    setPublishingId(postId);
    const success = await publishPostNow(postId);
    setPublishingId(null);
    setSnackbarMsg(
      success
        ? 'Post published live! Real-time analytics updated.'
        : 'Publishing simulation encountered a limit error.',
    );
  }

  const platformIcon = (p: SocialPlatform) => {
    switch (p) {
      case 'Instagram':
        return <Camera size={14} color="#E8DDFF" />;
      case 'LinkedIn':
        return <BriefcaseBusiness size={14} color="#70F7DC" />;
      case 'YouTube':
        return <Video size={14} color="#FF6B6B" />;
      default:
        return <Share2 size={14} color="#83D6CB" />;
    }
  };

  return (
    <ScreenContainer
      title="Dashboard"
      subtitle="Your multi-channel social command center."
      action={
        <Button
          mode="contained"
          icon={({ size, color }) => <Plus size={size} color={color} />}
          onPress={() => navigation.navigate('Create')}
          style={{ borderRadius: 12 }}
          compact
        >
          Create
        </Button>
      }
    >
      {/* Hero Highlight Card */}
      <View style={screenStyles.cardHighlight}>
        <View style={screenStyles.row}>
          <Text style={screenStyles.eyebrow}>AI Cadence Optimizer</Text>
          <View style={styles.pill}>
            <Zap size={12} color="#70F7DC" />
            <Text style={styles.pillText}>Optimized</Text>
          </View>
        </View>

        <Text variant="titleLarge" style={{ color: '#F5FAFA', fontWeight: '800', marginTop: 10 }}>
          {scheduledPosts.length} posts queued for launch
        </Text>
        <Text style={[screenStyles.muted, { marginTop: 6, lineHeight: 20 }]}>
          Content is evenly distributed across your active networks without detected fatigue.
        </Text>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <Button
            mode="contained"
            buttonColor={DarkTheme.colors.primary}
            textColor={DarkTheme.colors.onPrimary}
            icon={({ size, color }) => <CalendarDays size={size} color={color} />}
            onPress={() => navigation.navigate('Calendar')}
            style={{ borderRadius: 10 }}
          >
            Calendar
          </Button>
          <Button
            mode="outlined"
            textColor={DarkTheme.colors.onSurface}
            icon={({ size, color }) => <TrendingUp size={size} color={color} />}
            onPress={() => navigation.navigate('Insights')}
            style={{ borderRadius: 10, borderColor: DarkTheme.colors.outline }}
          >
            Insights
          </Button>
        </View>
      </View>

      {/* Metric Cards Row */}
      <View style={screenStyles.row}>
        <Text variant="titleMedium" style={{ color: '#F5F7FA', fontWeight: '800' }}>
          At a glance
        </Text>
        <Text style={screenStyles.muted}>Real-time updates</Text>
      </View>

      <View style={[screenStyles.row, { marginTop: 10, gap: 10 }]}>
        <View style={[screenStyles.card, { flex: 1, marginBottom: 0 }]}>
          <Text style={screenStyles.muted}>Scheduled</Text>
          <Text variant="headlineMedium" style={styles.metricVal}>
            {String(scheduledPosts.length).padStart(2, '0')}
          </Text>
          <Text style={[screenStyles.muted, { fontSize: 11, marginTop: 4 }]}>
            Upcoming posts
          </Text>
        </View>

        <View style={[screenStyles.card, { flex: 1, marginBottom: 0 }]}>
          <Text style={screenStyles.muted}>Engagement</Text>
          <Text variant="headlineMedium" style={[styles.metricVal, { color: '#70F7DC' }]}>
            {avgEngagementRate}%
          </Text>
          <Text style={[screenStyles.muted, { fontSize: 11, marginTop: 4 }]}>
            Avg across posts
          </Text>
        </View>

        <View style={[screenStyles.card, { flex: 1, marginBottom: 0 }]}>
          <Text style={screenStyles.muted}>Drafts</Text>
          <Text variant="headlineMedium" style={[styles.metricVal, { color: '#E8DDFF' }]}>
            {String(drafts.length).padStart(2, '0')}
          </Text>
          <Text style={[screenStyles.muted, { fontSize: 11, marginTop: 4 }]}>
            Ready to polish
          </Text>
        </View>
      </View>

      {/* Upcoming Posts Section */}
      <View style={[screenStyles.row, { marginTop: 22, marginBottom: 12 }]}>
        <Text variant="titleMedium" style={{ color: '#F5F7FA', fontWeight: '800' }}>
          Upcoming queue
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
          <Text style={{ color: DarkTheme.colors.primary, fontSize: 13, fontWeight: '700' }}>
            View all ({scheduledPosts.length})
          </Text>
        </TouchableOpacity>
      </View>

      {scheduledPosts.length === 0 ? (
        <View style={[screenStyles.card, { alignItems: 'center', paddingVertical: 24 }]}>
          <CalendarDays size={32} color={DarkTheme.colors.onSurfaceVariant} />
          <Text style={{ color: '#F5F7FA', fontWeight: '700', marginTop: 10 }}>
            No scheduled posts
          </Text>
          <Text style={[screenStyles.muted, { textAlign: 'center', marginTop: 4 }]}>
            Generate and schedule your next post in the AI Studio.
          </Text>
          <Button
            mode="contained-tonal"
            style={{ marginTop: 14 }}
            onPress={() => navigation.navigate('Create')}
          >
            Create Post
          </Button>
        </View>
      ) : (
        scheduledPosts.map((post) => (
          <View key={post.id} style={screenStyles.card}>
            <View style={screenStyles.row}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={{ color: '#F5F7FA', fontWeight: '700', fontSize: 15 }}>
                  {post.title}
                </Text>
                <Text
                  numberOfLines={2}
                  style={[screenStyles.muted, { fontSize: 12, marginTop: 4 }]}
                >
                  {post.content}
                </Text>
              </View>

              <Button
                mode="contained-tonal"
                compact
                disabled={publishingId === post.id}
                onPress={() => void handleQuickPublish(post.id)}
                icon={({ size, color }) =>
                  publishingId === post.id ? (
                    <ActivityIndicator size={12} color={color} />
                  ) : (
                    <Send size={size} color={color} />
                  )
                }
                style={{ borderRadius: 8 }}
              >
                Publish
              </Button>
            </View>

            <View style={[screenStyles.row, { marginTop: 12, paddingTop: 10, borderTopColor: DarkTheme.colors.outline, borderTopWidth: 1 }]}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {post.platforms.map((plat) => (
                  <Chip
                    key={plat}
                    compact
                    icon={() => platformIcon(plat)}
                    textStyle={{ fontSize: 11, color: '#DDE2E8' }}
                    style={{ backgroundColor: DarkTheme.colors.surfaceVariant }}
                  >
                    {plat}
                  </Chip>
                ))}
              </View>

              <Text style={{ color: DarkTheme.colors.onSurfaceVariant, fontSize: 11, fontWeight: '600' }}>
                {post.scheduledFor
                  ? new Date(post.scheduledFor).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Queued'}
              </Text>
            </View>
          </View>
        ))
      )}

      {/* Connected Channels Summary */}
      <View style={[screenStyles.row, { marginTop: 14, marginBottom: 12 }]}>
        <Text variant="titleMedium" style={{ color: '#F5F7FA', fontWeight: '800' }}>
          Channel connectivity
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Text style={{ color: DarkTheme.colors.primary, fontSize: 13, fontWeight: '700' }}>
            Manage
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[screenStyles.card, { paddingVertical: 8 }]}>
        {socialAccounts.map((account) => (
          <View
            key={account.platform}
            style={[
              screenStyles.row,
              {
                paddingVertical: 10,
                borderBottomColor: DarkTheme.colors.outline,
                borderBottomWidth:
                  account.platform === 'YouTube' ? 0 : 1,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: DarkTheme.colors.surfaceVariant,
                  borderRadius: 8,
                  height: 32,
                  justifyContent: 'center',
                  width: 32,
                }}
              >
                {platformIcon(account.platform)}
              </View>
              <View>
                <Text style={{ color: '#F5F7FA', fontWeight: '700', fontSize: 13 }}>
                  {account.name}
                </Text>
                <Text style={{ color: DarkTheme.colors.onSurfaceVariant, fontSize: 11 }}>
                  {account.handle} · {(account.followers / 1000).toFixed(1)}K followers
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View
                style={{
                  backgroundColor: account.connected ? '#00BFA5' : '#89929D',
                  borderRadius: 4,
                  height: 8,
                  width: 8,
                }}
              />
              <Text
                style={{
                  color: account.connected ? '#70F7DC' : '#89929D',
                  fontSize: 12,
                  fontWeight: '700',
                }}
              >
                {account.connected ? 'Active' : 'Offline'}
              </Text>
            </View>
          </View>
        ))}
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

const styles = StyleSheet.create({
  pill: {
    alignItems: 'center',
    backgroundColor: '#005144',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pillText: {
    color: '#70F7DC',
    fontSize: 11,
    fontWeight: '700',
  },
  metricVal: {
    color: '#F5F7FA',
    fontWeight: '800',
    marginTop: 6,
  },
});
