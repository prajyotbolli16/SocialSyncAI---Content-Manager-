import { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Button, Text, Chip, Card, ProgressBar, SegmentedButtons } from 'react-native-paper';
import {
  Eye,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Flame,
  CheckCircle2,
} from 'lucide-react-native';
import { ScreenContainer, screenStyles } from '../components/ScreenContainer';
import { DarkTheme } from '../theme/customTheme';
import { useStore } from '../store/useStore';
import { fatigueService } from '../services/fatigueService';
import { INITIAL_DAILY_ENGAGEMENT } from '../services/mockData';

export function InsightsScreen() {
  const posts = useStore((state) => state.posts);
  const [activeTab, setActiveTab] = useState<'overview' | 'feedback' | 'fatigue'>('overview');

  // Compute live metrics from published posts in store
  const publishedPosts = posts.filter((p) => p.status === 'published');

  const totalViews = publishedPosts.reduce((acc, p) => acc + (p.stats?.views || 0), 0) || 31200;
  const totalLikes = publishedPosts.reduce((acc, p) => acc + (p.stats?.likes || 0), 0) || 2130;
  const totalComments = publishedPosts.reduce((acc, p) => acc + (p.stats?.comments || 0), 0) || 157;
  const totalShares = publishedPosts.reduce((acc, p) => acc + (p.stats?.shares || 0), 0) || 292;

  const engagementRate = totalViews > 0
    ? (((totalLikes + totalComments + totalShares) / totalViews) * 100).toFixed(1)
    : '4.8';

  // Fatigue Reports from service
  const contentFatigue = fatigueService.analyzeContentFatigue(posts);
  const audienceFatigue = fatigueService.analyzeAudienceFatigue(posts);
  const engagementFeedback = fatigueService.getEngagementFeedback(posts);

  // Highest performing posts
  const topPosts = [...publishedPosts].sort(
    (a, b) => (b.stats?.views || 0) - (a.stats?.views || 0),
  );

  return (
    <ScreenContainer
      title="Analytics & Insights"
      subtitle="Deep-dive metrics, engagement feedback & fatigue analysis."
    >
      {/* Tab Selector */}
      <SegmentedButtons
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as any)}
        buttons={[
          { value: 'overview', label: 'Overview' },
          { value: 'feedback', label: 'Feedback' },
          { value: 'fatigue', label: 'Fatigue' },
        ]}
        style={{ marginBottom: 18 }}
        theme={{
          colors: {
            secondaryContainer: DarkTheme.colors.primaryContainer,
            onSecondaryContainer: '#70F7DC',
          },
        }}
      />

      {/* TAB 1: OVERVIEW & ENGAGEMENT CHARTS */}
      {activeTab === 'overview' && (
        <View>
          {/* Top Performance Metric Grid */}
          <View style={[screenStyles.row, { gap: 10, marginBottom: 10 }]}>
            <View style={[screenStyles.card, { flex: 1, marginBottom: 0 }]}>
              <View style={screenStyles.row}>
                <Eye size={16} color="#83D6CB" />
                <Text style={styles.trendTag}>+12.4%</Text>
              </View>
              <Text variant="headlineSmall" style={styles.statNumber}>
                {(totalViews / 1000).toFixed(1)}K
              </Text>
              <Text style={screenStyles.muted}>Total Views</Text>
            </View>

            <View style={[screenStyles.card, { flex: 1, marginBottom: 0 }]}>
              <View style={screenStyles.row}>
                <TrendingUp size={16} color="#70F7DC" />
                <Text style={styles.trendTag}>+0.8%</Text>
              </View>
              <Text variant="headlineSmall" style={[styles.statNumber, { color: '#70F7DC' }]}>
                {engagementRate}%
              </Text>
              <Text style={screenStyles.muted}>Engagement</Text>
            </View>
          </View>

          <View style={[screenStyles.row, { gap: 10, marginBottom: 14 }]}>
            <View style={[screenStyles.card, { flex: 1, marginBottom: 0 }]}>
              <View style={screenStyles.row}>
                <Heart size={16} color="#FF6B6B" />
                <Text style={styles.trendTag}>+18.2%</Text>
              </View>
              <Text variant="headlineSmall" style={styles.statNumber}>
                {totalLikes.toLocaleString()}
              </Text>
              <Text style={screenStyles.muted}>Total Likes</Text>
            </View>

            <View style={[screenStyles.card, { flex: 1, marginBottom: 0 }]}>
              <View style={screenStyles.row}>
                <Share2 size={16} color="#E8DDFF" />
                <Text style={styles.trendTag}>+24.0%</Text>
              </View>
              <Text variant="headlineSmall" style={[styles.statNumber, { color: '#E8DDFF' }]}>
                {totalShares.toLocaleString()}
              </Text>
              <Text style={screenStyles.muted}>Shares & Saves</Text>
            </View>
          </View>

          {/* Engagement Chart (Daily Volume Bars) */}
          <View style={screenStyles.card}>
            <View style={screenStyles.row}>
              <Text style={screenStyles.eyebrow}>Weekly Engagement Velocity</Text>
              <Text style={screenStyles.muted}>Last 7 Days</Text>
            </View>
            <Text style={{ color: '#F5F7FA', fontWeight: '700', fontSize: 16, marginTop: 4 }}>
              Daily View Volumes & Rates
            </Text>

            {/* Custom Bar Visualization */}
            <View style={styles.chartContainer}>
              {INITIAL_DAILY_ENGAGEMENT.map((item) => {
                const heightPercent = Math.min((item.views / 5000) * 100, 100);
                return (
                  <View key={item.day} style={styles.chartCol}>
                    <Text style={{ color: '#70F7DC', fontSize: 10, fontWeight: '700' }}>
                      {item.engagement}%
                    </Text>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          { height: `${heightPercent}%` },
                          item.day === 'Thu' && styles.barPeak,
                        ]}
                      />
                    </View>
                    <Text style={[screenStyles.muted, { fontSize: 11, fontWeight: '700' }]}>
                      {item.day}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Top Performing Posts */}
          <Text variant="titleMedium" style={{ color: '#F5F7FA', fontWeight: '800', marginVertical: 12 }}>
            Top Performing Posts
          </Text>

          {topPosts.length === 0 ? (
            <View style={[screenStyles.card, { paddingVertical: 20, alignItems: 'center' }]}>
              <Text style={screenStyles.muted}>No published posts yet.</Text>
            </View>
          ) : (
            topPosts.slice(0, 3).map((post, idx) => (
              <View key={post.id} style={screenStyles.card}>
                <View style={screenStyles.row}>
                  <View style={styles.rankPill}>
                    <Text style={{ color: '#70F7DC', fontWeight: '800', fontSize: 12 }}>
                      #{idx + 1}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={{ color: '#F5F7FA', fontWeight: '700', fontSize: 14 }}>
                      {post.title}
                    </Text>
                    <Text style={[screenStyles.muted, { fontSize: 11, marginTop: 2 }]}>
                      {post.platforms.join(' · ')}
                    </Text>
                  </View>
                </View>

                {post.stats && (
                  <View
                    style={[
                      screenStyles.row,
                      {
                        marginTop: 12,
                        paddingTop: 10,
                        borderTopColor: DarkTheme.colors.outline,
                        borderTopWidth: 1,
                      },
                    ]}
                  >
                    <Text style={{ color: '#83D6CB', fontSize: 12, fontWeight: '600' }}>
                      👁️ {(post.stats.views / 1000).toFixed(1)}K views
                    </Text>
                    <Text style={{ color: '#FF6B6B', fontSize: 12, fontWeight: '600' }}>
                      ❤️ {post.stats.likes} likes
                    </Text>
                    <Text style={{ color: '#E8DDFF', fontSize: 12, fontWeight: '600' }}>
                      💬 {post.stats.comments} replies
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      )}

      {/* TAB 2: ENGAGEMENT FEEDBACK INSIGHTS */}
      {activeTab === 'feedback' && (
        <View>
          {/* Summary ratios */}
          <View style={screenStyles.cardHighlight}>
            <Text style={screenStyles.eyebrow}>Interaction Ratio Analysis</Text>
            <Text variant="titleMedium" style={{ color: '#F5FAFA', fontWeight: '800', marginTop: 4 }}>
              How followers engage with your posts
            </Text>

            <View style={[screenStyles.row, { marginTop: 14 }]}>
              <View>
                <Text style={screenStyles.muted}>Comment Rate</Text>
                <Text variant="headlineSmall" style={{ color: '#70F7DC', fontWeight: '800' }}>
                  {engagementFeedback.commentRate}
                </Text>
                <Text style={[screenStyles.muted, { fontSize: 11 }]}>Per 1,000 views</Text>
              </View>
              <View>
                <Text style={screenStyles.muted}>Share / Save Rate</Text>
                <Text variant="headlineSmall" style={{ color: '#E8DDFF', fontWeight: '800' }}>
                  {engagementFeedback.shareRate}
                </Text>
                <Text style={[screenStyles.muted, { fontSize: 11 }]}>High virality indicator</Text>
              </View>
            </View>
          </View>

          {/* AI Recommended Improvements */}
          <Text variant="titleMedium" style={{ color: '#F5F7FA', fontWeight: '800', marginVertical: 12 }}>
            AI Engagement Recommendations
          </Text>

          {engagementFeedback.insights.map((item, idx) => (
            <View key={idx} style={screenStyles.card}>
              <View style={screenStyles.row}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <Lightbulb size={18} color={DarkTheme.colors.primary} />
                  <Text style={{ color: '#F5F7FA', fontWeight: '700', fontSize: 15 }}>
                    {item.title}
                  </Text>
                </View>
                <Chip
                  compact
                  textStyle={{ fontSize: 10, color: '#70F7DC' }}
                  style={{ backgroundColor: DarkTheme.colors.primaryContainer }}
                >
                  {item.priority} Priority
                </Chip>
              </View>
              <Text style={[screenStyles.muted, { marginTop: 8, lineHeight: 20 }]}>
                {item.description}
              </Text>
            </View>
          ))}

          {/* Action Checklist */}
          <View style={screenStyles.card}>
            <Text style={screenStyles.eyebrow}>Next Steps to Lift Engagement</Text>
            <View style={{ gap: 10, marginTop: 12 }}>
              {[
                'Add an open-ended question in the last 2 lines of your captions.',
                'Post when audience retention is highest: Tuesday & Thursday 9:00 AM.',
                'Engage in comment replies within the first 30 minutes of publishing.',
              ].map((step, idx) => (
                <View key={idx} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <CheckCircle2 size={16} color={DarkTheme.colors.primary} />
                  <Text style={{ color: '#E6EAEF', fontSize: 13, flex: 1 }}>{step}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* TAB 3: CONTENT & AUDIENCE FATIGUE DETECTORS */}
      {activeTab === 'fatigue' && (
        <View>
          {/* Feature 7: Content Fatigue Detector */}
          <View style={screenStyles.card}>
            <View style={screenStyles.row}>
              <Text style={screenStyles.eyebrow}>Feature 7: Content Fatigue Detector</Text>
              <Chip
                compact
                style={{
                  backgroundColor:
                    contentFatigue.level === 'High'
                      ? '#4D1212'
                      : contentFatigue.level === 'Moderate'
                      ? '#4D3312'
                      : '#113322',
                }}
                textStyle={{
                  color:
                    contentFatigue.level === 'High'
                      ? '#FFB4AB'
                      : contentFatigue.level === 'Moderate'
                      ? '#FFD599'
                      : '#70F7DC',
                  fontSize: 11,
                  fontWeight: '700',
                }}
              >
                {contentFatigue.level} Fatigue ({contentFatigue.score}%)
              </Chip>
            </View>

            <Text variant="titleMedium" style={{ color: '#F5F7FA', fontWeight: '800', marginTop: 10 }}>
              Repetition & Monotony Score
            </Text>
            <Text style={[screenStyles.muted, { marginTop: 4, marginBottom: 12 }]}>
              Analyzes queue topics, hook patterns, and overused hashtags across channels.
            </Text>

            <ProgressBar
              progress={contentFatigue.score / 100}
              color={contentFatigue.score > 50 ? DarkTheme.colors.error : DarkTheme.colors.primary}
              style={{ height: 8, borderRadius: 4 }}
            />

            {/* Overused items */}
            <Text style={{ color: '#F5F7FA', fontWeight: '700', fontSize: 13, marginTop: 16 }}>
              Detected Overused Patterns:
            </Text>
            <View style={{ gap: 6, marginTop: 8 }}>
              {contentFatigue.overusedHashtags.map((tag, idx) => (
                <View key={idx} style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                  <AlertTriangle size={14} color="#FFD599" />
                  <Text style={{ color: '#E6EAEF', fontSize: 12 }}>{tag}</Text>
                </View>
              ))}
            </View>

            {/* Fresh Ideas Suggested */}
            <Text style={{ color: '#F5F7FA', fontWeight: '700', fontSize: 13, marginTop: 16 }}>
              Suggested Fresh Angles:
            </Text>
            <View style={{ gap: 6, marginTop: 8 }}>
              {contentFatigue.freshAngles.map((angle, idx) => (
                <View key={idx} style={styles.ideaBox}>
                  <Sparkles size={14} color="#70F7DC" />
                  <Text style={{ color: '#70F7DC', fontSize: 12, flex: 1, fontWeight: '600' }}>
                    {angle}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Feature 8: Audience Fatigue Monitoring */}
          <View style={screenStyles.card}>
            <View style={screenStyles.row}>
              <Text style={screenStyles.eyebrow}>Feature 8: Audience Fatigue Monitoring</Text>
              <Chip
                compact
                style={{ backgroundColor: '#2E1A1A' }}
                textStyle={{ color: '#FFB4AB', fontSize: 11, fontWeight: '700' }}
              >
                Trend: {audienceFatigue.trend}
              </Chip>
            </View>

            <Text variant="titleMedium" style={{ color: '#F5F7FA', fontWeight: '800', marginTop: 10 }}>
              Sustained Drop Detection
            </Text>
            <Text style={[screenStyles.muted, { marginTop: 4, lineHeight: 20 }]}>
              Detects when followers tune out from repetitive formats before overall follower loss occurs.
            </Text>

            <View style={[screenStyles.row, { marginTop: 14, padding: 12, backgroundColor: DarkTheme.colors.surfaceVariant, borderRadius: 10 }]}>
              <View>
                <Text style={screenStyles.muted}>Engagement Delta</Text>
                <Text style={{ color: '#FF6B6B', fontSize: 18, fontWeight: '800', marginTop: 2 }}>
                  -{audienceFatigue.dropPercentage}%
                </Text>
              </View>
              <View>
                <Text style={screenStyles.muted}>Burnout Risk</Text>
                <Text style={{ color: '#FFD599', fontSize: 18, fontWeight: '800', marginTop: 2 }}>
                  {audienceFatigue.score > 30 ? 'Caution' : 'Healthy'}
                </Text>
              </View>
            </View>

            {/* Warning Signals */}
            <Text style={{ color: '#F5F7FA', fontWeight: '700', fontSize: 13, marginTop: 16 }}>
              Observed Signals:
            </Text>
            <View style={{ gap: 6, marginTop: 8 }}>
              {audienceFatigue.warningSignals.map((signal, idx) => (
                <View key={idx} style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                  <ShieldAlert size={14} color="#FF6B6B" />
                  <Text style={{ color: '#E6EAEF', fontSize: 12 }}>{signal}</Text>
                </View>
              ))}
            </View>

            {/* Recommended Experiments */}
            <Text style={{ color: '#F5F7FA', fontWeight: '700', fontSize: 13, marginTop: 16 }}>
              Recommended Content Experiments:
            </Text>
            <View style={{ gap: 8, marginTop: 8 }}>
              {audienceFatigue.recommendedExperiments.map((exp, idx) => (
                <View key={idx} style={styles.experimentBox}>
                  <Flame size={14} color={DarkTheme.colors.primary} />
                  <Text style={{ color: '#E6EAEF', fontSize: 12, flex: 1, fontWeight: '600' }}>
                    {exp}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statNumber: {
    color: '#F5F7FA',
    fontWeight: '800',
    marginTop: 6,
  },
  trendTag: {
    color: '#70F7DC',
    fontSize: 11,
    fontWeight: '700',
  },
  chartContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    height: 140,
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 8,
  },
  chartCol: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    width: '12%',
  },
  barTrack: {
    backgroundColor: DarkTheme.colors.surfaceVariant,
    borderRadius: 6,
    height: 90,
    justifyContent: 'flex-end',
    marginVertical: 6,
    width: 14,
  },
  barFill: {
    backgroundColor: DarkTheme.colors.primary,
    borderRadius: 6,
    width: '100%',
  },
  barPeak: {
    backgroundColor: '#70F7DC',
  },
  rankPill: {
    alignItems: 'center',
    backgroundColor: DarkTheme.colors.primaryContainer,
    borderRadius: 8,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  ideaBox: {
    alignItems: 'center',
    backgroundColor: '#0F2625',
    borderColor: '#005144',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    padding: 10,
  },
  experimentBox: {
    alignItems: 'center',
    backgroundColor: DarkTheme.colors.surfaceVariant,
    borderColor: DarkTheme.colors.outline,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    padding: 10,
  },
});
