import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import {
  Button,
  Chip,
  Text,
  TextInput,
  ActivityIndicator,
  Card,
  Snackbar,
  Modal,
  Portal,
} from 'react-native-paper';
import {
  Sparkles,
  Image as ImageIcon,
  Calendar,
  Send,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ScreenContainer, screenStyles } from '../components/ScreenContainer';
import { DarkTheme } from '../theme/customTheme';
import { useStore } from '../store/useStore';
import { aiStudioService } from '../services/aiStudioService';
import { PLATFORM_LIMITS, socialMediaService } from '../services/socialMediaService';
import type { MainTabParamList } from '../navigation/types';
import type { SocialPlatform } from '../types';

const PLATFORMS: SocialPlatform[] = ['Instagram', 'LinkedIn', 'X', 'Facebook', 'YouTube'];
const TONES: Array<'Professional' | 'Casual' | 'Engaging' | 'Educational' | 'Promotional'> = [
  'Engaging',
  'Professional',
  'Casual',
  'Educational',
  'Promotional',
];

export function CreateScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  const currentDraft = useStore((state) => state.currentDraft);
  const updateCurrentDraft = useStore((state) => state.updateCurrentDraft);
  const saveDraft = useStore((state) => state.saveDraft);
  const schedulePost = useStore((state) => state.schedulePost);
  const publishPostNow = useStore((state) => state.publishPostNow);

  const [idea, setIdea] = useState(currentDraft.idea || '');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(
    currentDraft.platforms.length > 0 ? currentDraft.platforms : ['Instagram'],
  );
  const [selectedTone, setSelectedTone] = useState(currentDraft.tone || 'Engaging');
  const [generatedCaption, setGeneratedCaption] = useState(currentDraft.content || '');
  const [hashtags, setHashtags] = useState<string[]>(currentDraft.hashtags || []);
  const [mediaUri, setMediaUri] = useState<string | undefined>(currentDraft.mediaUri);
  const [alternativeHooks, setAlternativeHooks] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [autosaveText, setAutosaveText] = useState('Draft saved');
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Schedule Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDelayHours, setScheduleDelayHours] = useState(2); // hours from now

  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Autosave whenever content changes
  useEffect(() => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

    autosaveTimerRef.current = setTimeout(() => {
      const updatedDraft = {
        ...currentDraft,
        idea,
        content: generatedCaption,
        platforms: selectedPlatforms,
        tone: selectedTone,
        hashtags,
        mediaUri,
        lastSavedAt: new Date().toISOString(),
      };
      saveDraft(updatedDraft);
      updateCurrentDraft(updatedDraft);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setAutosaveText(`Autosaved at ${timeStr}`);
    }, 1200);

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [idea, generatedCaption, selectedPlatforms, selectedTone, hashtags, mediaUri]);

  // Platform selection toggle
  function togglePlatform(platform: SocialPlatform) {
    if (selectedPlatforms.includes(platform)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platform));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  }

  // Pick Media
  async function handlePickMedia() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setMediaUri(result.assets[0].uri);
        setSnackbarMessage('Media attached successfully!');
      }
    } catch {
      Alert.alert('Permission needed', 'Please grant photo permissions to attach media.');
    }
  }

  // AI Content Studio Generation
  async function handleGenerate() {
    if (!idea.trim()) {
      setSnackbarMessage('Please enter a post idea or prompt first.');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await aiStudioService.generateDraft({
        idea,
        tone: selectedTone,
        platforms: selectedPlatforms,
      });

      setGeneratedCaption(response.caption);
      setHashtags(response.hashtags);
      setAlternativeHooks(response.alternativeHooks);
      setSnackbarMessage('AI draft generated! Review and tune below.');
    } catch {
      setSnackbarMessage('Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  // Add custom hashtag
  function handleAddHashtag() {
    const newTag = `#${idea.replace(/\s+/g, '').slice(0, 12).toLowerCase()}`;
    if (!hashtags.includes(newTag)) {
      setHashtags([...hashtags, newTag]);
    }
  }

  // Remove hashtag
  function handleRemoveHashtag(tag: string) {
    setHashtags(hashtags.filter((h) => h !== tag));
  }

  // Swap hook
  function handleApplyHook(hook: string) {
    const lines = generatedCaption.split('\n');
    lines[0] = hook;
    setGeneratedCaption(lines.join('\n'));
    setSnackbarMessage('Opening hook updated!');
  }

  // Check character limits
  const strictestLimit = Math.min(
    ...selectedPlatforms.map((p) => PLATFORM_LIMITS[p]?.maxCharacters || 2200),
  );
  const fullContentLength =
    generatedCaption.length +
    (hashtags.length > 0 ? `\n\n${hashtags.join(' ')}`.length : 0);
  const isOverLimit = fullContentLength > strictestLimit;

  // Publish Post immediately
  async function handlePublishImmediately() {
    if (!generatedCaption.trim()) {
      setSnackbarMessage('Please write or generate a caption before publishing.');
      return;
    }

    const validation = socialMediaService.validatePost({
      content: generatedCaption,
      platforms: selectedPlatforms,
      mediaUri,
    });

    if (!validation.isValid) {
      const errorMsg = Object.values(validation.errors)[0];
      Alert.alert('Publishing Error', errorMsg);
      return;
    }

    setIsPublishing(true);
    try {
      const scheduledDate = new Date();
      const newPostId = await schedulePost(
        {
          title: idea.trim() || 'New Social Post',
          content: `${generatedCaption}\n\n${hashtags.join(' ')}`,
          platforms: selectedPlatforms,
          mediaUri,
          hashtags,
        },
        scheduledDate,
      );

      const success = await publishPostNow(newPostId);
      setIsPublishing(false);

      if (success) {
        setSnackbarMessage('🎉 Post published live across your selected channels!');
        setTimeout(() => navigation.navigate('Home'), 1000);
      }
    } catch {
      setIsPublishing(false);
      setSnackbarMessage('Publishing simulation error.');
    }
  }

  // Schedule Post for later
  async function handleConfirmSchedule() {
    if (!generatedCaption.trim()) {
      setSnackbarMessage('Please write or generate a caption before scheduling.');
      return;
    }

    setIsScheduling(true);
    try {
      const scheduledDate = new Date(Date.now() + scheduleDelayHours * 3600 * 1000);

      await schedulePost(
        {
          title: idea.trim() || 'Scheduled Campaign',
          content: `${generatedCaption}\n\n${hashtags.join(' ')}`,
          platforms: selectedPlatforms,
          mediaUri,
          hashtags,
        },
        scheduledDate,
      );

      setIsScheduling(false);
      setShowScheduleModal(false);
      setSnackbarMessage(
        `📅 Post scheduled for ${scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      );
      setTimeout(() => navigation.navigate('Calendar'), 1200);
    } catch {
      setIsScheduling(false);
      setSnackbarMessage('Scheduling error.');
    }
  }

  return (
    <ScreenContainer
      title="AI Studio"
      subtitle="Craft, optimize & synchronize your content."
      action={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Clock size={12} color="#70F7DC" />
          <Text style={{ color: '#70F7DC', fontSize: 11, fontWeight: '600' }}>
            {autosaveText}
          </Text>
        </View>
      }
    >
      {/* 1. Prompt & Idea Input */}
      <View style={screenStyles.card}>
        <Text style={screenStyles.eyebrow}>Step 1: Ideation</Text>
        <Text variant="titleMedium" style={{ color: '#F5F7FA', fontWeight: '800', marginTop: 6 }}>
          What is your topic or goal?
        </Text>

        <TextInput
          label="Topic, hook, or core message"
          mode="outlined"
          multiline
          numberOfLines={3}
          value={idea}
          onChangeText={setIdea}
          placeholder="e.g. Announcing our 2.0 release with real-time fatigue monitoring..."
          style={{ backgroundColor: DarkTheme.colors.surfaceVariant, marginTop: 12 }}
        />

        {/* Tone Selector */}
        <Text style={[screenStyles.muted, { marginTop: 14, marginBottom: 8, fontWeight: '600' }]}>
          Tone & Personality:
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {TONES.map((tone) => (
            <Chip
              key={tone}
              selected={selectedTone === tone}
              onPress={() => setSelectedTone(tone)}
              style={{
                backgroundColor:
                  selectedTone === tone
                    ? DarkTheme.colors.primaryContainer
                    : DarkTheme.colors.surfaceVariant,
              }}
              textStyle={{
                color: selectedTone === tone ? '#70F7DC' : '#A4AFBD',
                fontSize: 12,
                fontWeight: '700',
              }}
            >
              {tone}
            </Chip>
          ))}
        </View>

        {/* Target Platforms */}
        <Text style={[screenStyles.muted, { marginTop: 14, marginBottom: 8, fontWeight: '600' }]}>
          Target Platforms:
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {PLATFORMS.map((platform) => {
            const isSelected = selectedPlatforms.includes(platform);
            return (
              <Chip
                key={platform}
                selected={isSelected}
                onPress={() => togglePlatform(platform)}
                style={{
                  backgroundColor: isSelected ? '#3B1866' : DarkTheme.colors.surfaceVariant,
                }}
                textStyle={{
                  color: isSelected ? '#E8DDFF' : '#A4AFBD',
                  fontSize: 12,
                  fontWeight: '700',
                }}
              >
                {platform}
              </Chip>
            );
          })}
        </View>

        {/* Generate Button */}
        <Button
          mode="contained"
          disabled={isGenerating}
          loading={isGenerating}
          icon={({ size, color }) => <Sparkles size={size} color={color} />}
          onPress={() => void handleGenerate()}
          style={{ marginTop: 18, borderRadius: 12 }}
          buttonColor={DarkTheme.colors.primary}
          textColor={DarkTheme.colors.onPrimary}
        >
          Generate AI Draft
        </Button>
      </View>

      {/* 2. Media Attachment */}
      <View style={screenStyles.card}>
        <View style={screenStyles.row}>
          <Text style={screenStyles.eyebrow}>Step 2: Media</Text>
          <TouchableOpacity onPress={() => void handlePickMedia()}>
            <Text style={{ color: DarkTheme.colors.primary, fontSize: 13, fontWeight: '700' }}>
              {mediaUri ? 'Change Photo' : 'Upload Photo'}
            </Text>
          </TouchableOpacity>
        </View>

        {mediaUri ? (
          <View style={{ marginTop: 12, position: 'relative' }}>
            <Image
              source={{ uri: mediaUri }}
              style={{ height: 200, width: '100%', borderRadius: 12 }}
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={() => setMediaUri(undefined)}
              style={styles.removeMediaBtn}
            >
              <Trash2 size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => void handlePickMedia()}
            style={styles.uploadPlaceholder}
          >
            <ImageIcon size={28} color={DarkTheme.colors.onSurfaceVariant} />
            <Text style={{ color: '#F5F7FA', fontWeight: '600', marginTop: 8 }}>
              Attach Image or Video
            </Text>
            <Text style={[screenStyles.muted, { fontSize: 11, marginTop: 2 }]}>
              Supports PNG, JPG, MP4 · Camera Roll
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 3. AI Caption Editor */}
      <View style={screenStyles.card}>
        <View style={screenStyles.row}>
          <Text style={screenStyles.eyebrow}>Step 3: Polish & Hashtags</Text>
          <Text
            style={{
              color: isOverLimit ? DarkTheme.colors.error : DarkTheme.colors.onSurfaceVariant,
              fontSize: 12,
              fontWeight: '700',
            }}
          >
            {fullContentLength} / {strictestLimit} chars
          </Text>
        </View>

        {isOverLimit && (
          <View style={styles.warningBox}>
            <AlertCircle size={14} color={DarkTheme.colors.error} />
            <Text style={{ color: DarkTheme.colors.error, fontSize: 11, fontWeight: '600' }}>
              Content exceeds character limit for {selectedPlatforms.join(', ')}.
            </Text>
          </View>
        )}

        <TextInput
          label="Generated Caption"
          mode="outlined"
          multiline
          numberOfLines={6}
          value={generatedCaption}
          onChangeText={setGeneratedCaption}
          placeholder="Caption will appear here after clicking Generate..."
          style={{ backgroundColor: DarkTheme.colors.surfaceVariant, marginTop: 12 }}
        />

        {/* Hashtags Section */}
        <View style={[screenStyles.row, { marginTop: 14, marginBottom: 8 }]}>
          <Text style={{ color: '#F5F7FA', fontWeight: '700', fontSize: 13 }}>
            Hashtags ({hashtags.length})
          </Text>
          <TouchableOpacity onPress={handleAddHashtag}>
            <Text style={{ color: DarkTheme.colors.primary, fontSize: 12, fontWeight: '700' }}>
              + Add tag
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {hashtags.map((tag) => (
            <Chip
              key={tag}
              onClose={() => handleRemoveHashtag(tag)}
              style={{ backgroundColor: DarkTheme.colors.surfaceVariant }}
              textStyle={{ color: '#70F7DC', fontSize: 12 }}
            >
              {tag}
            </Chip>
          ))}
        </View>

        {/* Alternative Hooks */}
        {alternativeHooks.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <Text style={[screenStyles.muted, { fontSize: 12, fontWeight: '700', marginBottom: 8 }]}>
              AI Alternative Opening Hooks (Tap to swap):
            </Text>
            {alternativeHooks.map((hook, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handleApplyHook(hook)}
                style={styles.hookChip}
              >
                <Sparkles size={12} color="#70F7DC" />
                <Text style={{ color: '#E6EAEF', fontSize: 12, flex: 1 }}>{hook}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 22 }}>
          <Button
            mode="contained"
            style={{ flex: 1, borderRadius: 12 }}
            buttonColor={DarkTheme.colors.secondary}
            textColor="#FFFFFF"
            disabled={isScheduling}
            icon={({ size, color }) => <Calendar size={size} color={color} />}
            onPress={() => setShowScheduleModal(true)}
          >
            Schedule
          </Button>

          <Button
            mode="contained"
            style={{ flex: 1, borderRadius: 12 }}
            buttonColor={DarkTheme.colors.primary}
            textColor={DarkTheme.colors.onPrimary}
            disabled={isPublishing}
            loading={isPublishing}
            icon={({ size, color }) => <Send size={size} color={color} />}
            onPress={() => void handlePublishImmediately()}
          >
            Publish Now
          </Button>
        </View>
      </View>

      {/* Schedule Picker Modal */}
      <Portal>
        <Modal
          visible={showScheduleModal}
          onDismiss={() => setShowScheduleModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text variant="titleMedium" style={{ color: '#F5F7FA', fontWeight: '800' }}>
            Schedule Post
          </Text>
          <Text style={[screenStyles.muted, { marginTop: 4, marginBottom: 16 }]}>
            Pick an AI-optimized time slot for your audience.
          </Text>

          <View style={{ gap: 8 }}>
            {[
              { label: 'In 2 hours (Recommended peak)', hours: 2 },
              { label: 'Tomorrow morning (9:00 AM)', hours: 18 },
              { label: 'In 2 days (Weekend cadence)', hours: 48 },
            ].map((slot) => (
              <TouchableOpacity
                key={slot.hours}
                onPress={() => setScheduleDelayHours(slot.hours)}
                style={[
                  styles.slotOption,
                  scheduleDelayHours === slot.hours && styles.slotOptionSelected,
                ]}
              >
                <Clock
                  size={16}
                  color={
                    scheduleDelayHours === slot.hours
                      ? DarkTheme.colors.primary
                      : DarkTheme.colors.onSurfaceVariant
                  }
                />
                <Text
                  style={{
                    color: scheduleDelayHours === slot.hours ? '#70F7DC' : '#E6EAEF',
                    fontWeight: '700',
                    fontSize: 13,
                  }}
                >
                  {slot.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            mode="contained"
            loading={isScheduling}
            disabled={isScheduling}
            onPress={() => void handleConfirmSchedule()}
            style={{ marginTop: 20, borderRadius: 12 }}
            buttonColor={DarkTheme.colors.primary}
            textColor={DarkTheme.colors.onPrimary}
          >
            Confirm Schedule & Set Alert
          </Button>
        </Modal>
      </Portal>

      <Snackbar
        visible={Boolean(snackbarMessage)}
        onDismiss={() => setSnackbarMessage('')}
        duration={3500}
        style={{ backgroundColor: DarkTheme.colors.surfaceVariant }}
      >
        <Text style={{ color: '#F5F7FA' }}>{snackbarMessage}</Text>
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  uploadPlaceholder: {
    alignItems: 'center',
    borderColor: DarkTheme.colors.outline,
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 28,
  },
  removeMediaBtn: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 16,
    padding: 6,
    position: 'absolute',
    right: 10,
    top: 10,
  },
  warningBox: {
    alignItems: 'center',
    backgroundColor: '#301416',
    borderColor: '#73161C',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    padding: 8,
  },
  hookChip: {
    alignItems: 'center',
    backgroundColor: DarkTheme.colors.surfaceVariant,
    borderColor: DarkTheme.colors.outline,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
    padding: 10,
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
