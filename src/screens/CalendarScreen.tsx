import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Button, Text, Chip, Modal, Portal, Snackbar } from 'react-native-paper';
import {
  CalendarDays,
  Clock,
  Camera,
  BriefcaseBusiness,
  Video,
  Share2,
  Trash2,
  ArrowRight,
  Plus,
  CheckCircle,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ScreenContainer, screenStyles } from '../components/ScreenContainer';
import { DarkTheme } from '../theme/customTheme';
import { useStore } from '../store/useStore';
import { notificationService } from '../services/notificationService';
import type { MainTabParamList } from '../navigation/types';
import type { Post, SocialPlatform } from '../types';

export function CalendarScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  const posts = useStore((state) => state.posts);
  const updatePost = useStore((state) => state.updatePost);
  const deletePost = useStore((state) => state.deletePost);

  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDays, setRescheduleDays] = useState(1);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  // Selected calendar day (12-18 representing current week days)
  const [activeDayNumber, setActiveDayNumber] = useState<number>(new Date().getDate());

  const scheduledPosts = posts.filter((p) => p.status === 'scheduled');
  const filteredPosts =
    selectedPlatform === 'All'
      ? scheduledPosts
      : scheduledPosts.filter((p) =>
          p.platforms.includes(selectedPlatform as SocialPlatform),
        );

  const platformIcon = (p: SocialPlatform) => {
    switch (p) {
      case 'Instagram':
        return <Camera size={16} color="#E8DDFF" />;
      case 'LinkedIn':
        return <BriefcaseBusiness size={16} color="#70F7DC" />;
      case 'YouTube':
        return <Video size={16} color="#FF6B6B" />;
      default:
        return <Share2 size={16} color="#83D6CB" />;
    }
  };

  // Reschedule post
  async function handleConfirmReschedule() {
    if (!selectedPost) return;

    const currentTarget = selectedPost.scheduledFor
      ? new Date(selectedPost.scheduledFor).getTime()
      : Date.now();
    const newDate = new Date(currentTarget + rescheduleDays * 86400 * 1000);

    updatePost(selectedPost.id, {
      scheduledFor: newDate.toISOString(),
    });

    // Update local scheduled notification
    await notificationService.schedulePostNotification(
      selectedPost.title,
      newDate,
      selectedPost.platforms,
    );

    setShowRescheduleModal(false);
    setSelectedPost(null);
    setSnackbarMsg(
      `Post rescheduled to ${newDate.toLocaleDateString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })}! Notification updated.`,
    );
  }

  // Cancel/delete scheduled post
  function handleDeletePost(postId: string) {
    Alert.alert(
      'Remove Scheduled Post',
      'Are you sure you want to unschedule and remove this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            deletePost(postId);
            setSnackbarMsg('Post unscheduled and removed.');
          },
        },
      ],
    );
  }

  // Calendar week days generator
  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + 1 + i); // Monday to Sunday
    return {
      dayName: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i],
      dateNumber: d.getDate(),
      fullDate: d,
      isToday: d.toDateString() === today.toDateString(),
    };
  });

  return (
    <ScreenContainer
      title="Content Calendar"
      subtitle="Schedule, reschedule & monitor upcoming queue."
      action={
        <Button
          mode="contained"
          icon={({ size, color }) => <Plus size={size} color={color} />}
          onPress={() => navigation.navigate('Create')}
          compact
          style={{ borderRadius: 10 }}
        >
          New
        </Button>
      }
    >
      {/* Month & Week Strip */}
      <View style={screenStyles.card}>
        <View style={screenStyles.row}>
          <Text variant="titleMedium" style={{ color: '#F5F7FA', fontWeight: '800' }}>
            {today.toLocaleDateString([], { month: 'long', year: 'numeric' })}
          </Text>
          <View style={styles.badgePill}>
            <Clock size={12} color="#70F7DC" />
            <Text style={{ color: '#70F7DC', fontSize: 11, fontWeight: '700' }}>
              Auto-Notification Active
            </Text>
          </View>
        </View>

        {/* Days of week header */}
        <View style={[screenStyles.row, { marginTop: 14 }]}>
          {weekDays.map((item, idx) => (
            <Text
              key={idx}
              style={[
                screenStyles.muted,
                { textAlign: 'center', width: '13%', fontWeight: '700' },
              ]}
            >
              {item.dayName}
            </Text>
          ))}
        </View>

        {/* Date numbers row */}
        <View style={[screenStyles.row, { marginTop: 10 }]}>
          {weekDays.map((item) => {
            const isSelected = activeDayNumber === item.dateNumber;
            return (
              <TouchableOpacity
                key={item.dateNumber}
                onPress={() => setActiveDayNumber(item.dateNumber)}
                style={[
                  styles.calendarDay,
                  isSelected && styles.calendarDaySelected,
                  item.isToday && !isSelected && styles.calendarDayToday,
                ]}
              >
                <Text
                  style={{
                    color: isSelected ? '#00382E' : item.isToday ? '#70F7DC' : '#DDE2E8',
                    fontWeight: isSelected || item.isToday ? '800' : '500',
                    fontSize: 13,
                  }}
                >
                  {item.dateNumber}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Platform Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 6, marginBottom: 14 }}
      >
        {['All', 'Instagram', 'LinkedIn', 'X', 'Facebook', 'YouTube'].map((plat) => (
          <Chip
            key={plat}
            selected={selectedPlatform === plat}
            onPress={() => setSelectedPlatform(plat)}
            style={{
              backgroundColor:
                selectedPlatform === plat
                  ? DarkTheme.colors.primaryContainer
                  : DarkTheme.colors.surface,
            }}
            textStyle={{
              color: selectedPlatform === plat ? '#70F7DC' : '#A4AFBD',
              fontSize: 12,
              fontWeight: '700',
            }}
          >
            {plat}
          </Chip>
        ))}
      </ScrollView>

      {/* Scheduled Posts List */}
      <View style={[screenStyles.row, { marginBottom: 12 }]}>
        <Text variant="titleMedium" style={{ color: '#F5F7FA', fontWeight: '800' }}>
          Queued for publishing ({filteredPosts.length})
        </Text>
        <Text style={screenStyles.muted}>Tap to reschedule</Text>
      </View>

      {filteredPosts.length === 0 ? (
        <View style={[screenStyles.card, { alignItems: 'center', paddingVertical: 32 }]}>
          <CalendarDays size={36} color={DarkTheme.colors.onSurfaceVariant} />
          <Text style={{ color: '#F5F7FA', fontWeight: '700', marginTop: 10, fontSize: 16 }}>
            No scheduled posts found
          </Text>
          <Text style={[screenStyles.muted, { textAlign: 'center', marginTop: 4, maxWidth: 260 }]}>
            Create your next post in the AI Studio and choose a schedule time.
          </Text>
          <Button
            mode="contained"
            buttonColor={DarkTheme.colors.primary}
            textColor={DarkTheme.colors.onPrimary}
            onPress={() => navigation.navigate('Create')}
            style={{ marginTop: 16, borderRadius: 10 }}
          >
            Schedule a Post
          </Button>
        </View>
      ) : (
        filteredPosts.map((post) => {
          const scheduledDate = post.scheduledFor ? new Date(post.scheduledFor) : new Date();
          return (
            <View key={post.id} style={screenStyles.card}>
              <View style={screenStyles.row}>
                <View style={{ flex: 1 }}>
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

                <TouchableOpacity
                  onPress={() => handleDeletePost(post.id)}
                  style={styles.deleteBtn}
                >
                  <Trash2 size={16} color={DarkTheme.colors.error} />
                </TouchableOpacity>
              </View>

              {/* Timing & Reschedule Trigger */}
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

                <TouchableOpacity
                  onPress={() => {
                    setSelectedPost(post);
                    setShowRescheduleModal(true);
                  }}
                  style={styles.rescheduleBadge}
                >
                  <Clock size={12} color="#70F7DC" />
                  <Text style={{ color: '#70F7DC', fontSize: 11, fontWeight: '700' }}>
                    {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                    {scheduledDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </Text>
                  <ArrowRight size={10} color="#70F7DC" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

      {/* Reschedule Modal */}
      <Portal>
        <Modal
          visible={showRescheduleModal}
          onDismiss={() => setShowRescheduleModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text variant="titleMedium" style={{ color: '#F5F7FA', fontWeight: '800' }}>
            Reschedule Post
          </Text>
          <Text style={[screenStyles.muted, { marginTop: 4, marginBottom: 14 }]}>
            Change release timing for "{selectedPost?.title}".
          </Text>

          <View style={{ gap: 8 }}>
            {[
              { label: 'Push by +1 Day (Same time)', days: 1 },
              { label: 'Push by +2 Days', days: 2 },
              { label: 'Push by +1 Week (Cadence reset)', days: 7 },
            ].map((option) => (
              <TouchableOpacity
                key={option.days}
                onPress={() => setRescheduleDays(option.days)}
                style={[
                  styles.slotOption,
                  rescheduleDays === option.days && styles.slotOptionSelected,
                ]}
              >
                <CalendarDays
                  size={16}
                  color={
                    rescheduleDays === option.days
                      ? DarkTheme.colors.primary
                      : DarkTheme.colors.onSurfaceVariant
                  }
                />
                <Text
                  style={{
                    color: rescheduleDays === option.days ? '#70F7DC' : '#E6EAEF',
                    fontWeight: '700',
                    fontSize: 13,
                  }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            mode="contained"
            buttonColor={DarkTheme.colors.primary}
            textColor={DarkTheme.colors.onPrimary}
            onPress={() => void handleConfirmReschedule()}
            style={{ marginTop: 18, borderRadius: 12 }}
          >
            Apply Reschedule
          </Button>
        </Modal>
      </Portal>

      <Snackbar
        visible={Boolean(snackbarMsg)}
        onDismiss={() => setSnackbarMsg('')}
        duration={3500}
        style={{ backgroundColor: DarkTheme.colors.surfaceVariant }}
      >
        <Text style={{ color: '#F5F7FA' }}>{snackbarMsg}</Text>
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  badgePill: {
    alignItems: 'center',
    backgroundColor: '#005144',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  calendarDay: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: '13%',
  },
  calendarDaySelected: {
    backgroundColor: DarkTheme.colors.primary,
  },
  calendarDayToday: {
    borderColor: DarkTheme.colors.primary,
    borderWidth: 1,
  },
  deleteBtn: {
    backgroundColor: DarkTheme.colors.surfaceVariant,
    borderRadius: 8,
    padding: 8,
  },
  rescheduleBadge: {
    alignItems: 'center',
    backgroundColor: '#0F2625',
    borderColor: '#005144',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  modalContent: {
    backgroundColor: DarkTheme.colors.surface,
    borderColor: DarkTheme.colors.outline,
    borderRadius: 16,
    borderWidth: 1,
    margin: 20,
    padding: 20,
  },
  slotOption: {
    alignItems: 'center',
    backgroundColor: DarkTheme.colors.surfaceVariant,
    borderColor: DarkTheme.colors.outline,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  slotOptionSelected: {
    backgroundColor: '#0F2B2A',
    borderColor: DarkTheme.colors.primary,
  },
});
