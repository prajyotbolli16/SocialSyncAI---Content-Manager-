import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import type {
  Post,
  Draft,
  SocialAccount,
  SocialPlatform,
  AppNotification,
} from '../types';
import {
  INITIAL_POSTS,
  INITIAL_DRAFTS,
  INITIAL_SOCIAL_ACCOUNTS,
  INITIAL_NOTIFICATIONS,
} from '../services/mockData';
import { socialMediaService } from '../services/socialMediaService';
import { notificationService } from '../services/notificationService';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface AppState {
  session: Session | null;
  isDemoMode: boolean;
  posts: Post[];
  drafts: Draft[];
  currentDraft: Draft;
  socialAccounts: SocialAccount[];
  notifications: AppNotification[];

  // Actions
  setSession: (session: Session | null) => void;
  setDemoMode: (isDemo: boolean) => void;
  addPost: (post: Post) => void;
  updatePost: (id: string, updates: Partial<Post>) => void;
  deletePost: (id: string) => void;
  saveDraft: (draft: Draft) => void;
  deleteDraft: (id: string) => void;
  updateCurrentDraft: (updates: Partial<Draft>) => void;
  resetCurrentDraft: () => void;
  toggleSocialAccount: (platform: SocialPlatform) => void;
  publishPostNow: (postId: string) => Promise<boolean>;
  schedulePost: (post: Omit<Post, 'id' | 'status'>, scheduledDate: Date) => Promise<string>;
  markNotificationRead: (id: string) => void;
}

const defaultDraft: Draft = {
  id: 'draft-temp',
  idea: '',
  content: '',
  hashtags: [],
  platforms: ['Instagram'],
  tone: 'Engaging',
  lastSavedAt: new Date().toISOString(),
};

export const useStore = create<AppState>((set, get) => ({
  session: null,
  isDemoMode: !isSupabaseConfigured,
  posts: INITIAL_POSTS,
  drafts: INITIAL_DRAFTS,
  currentDraft: { ...defaultDraft, id: `draft-${Date.now()}` },
  socialAccounts: INITIAL_SOCIAL_ACCOUNTS,
  notifications: INITIAL_NOTIFICATIONS,

  setSession: (session) =>
    set({
      session,
      isDemoMode: session ? false : !isSupabaseConfigured,
    }),

  setDemoMode: (isDemoMode) => set({ isDemoMode }),

  addPost: (post) =>
    set((state) => ({
      posts: [post, ...state.posts],
    })),

  updatePost: (id, updates) =>
    set((state) => ({
      posts: state.posts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  deletePost: (id) =>
    set((state) => ({
      posts: state.posts.filter((p) => p.id !== id),
    })),

  saveDraft: (draft) =>
    set((state) => {
      const existing = state.drafts.findIndex((d) => d.id === draft.id);
      if (existing >= 0) {
        const updated = [...state.drafts];
        updated[existing] = { ...draft, lastSavedAt: new Date().toISOString() };
        return { drafts: updated };
      }
      return {
        drafts: [{ ...draft, lastSavedAt: new Date().toISOString() }, ...state.drafts],
      };
    }),

  deleteDraft: (id) =>
    set((state) => ({
      drafts: state.drafts.filter((d) => d.id !== id),
    })),

  updateCurrentDraft: (updates) =>
    set((state) => {
      const updated = {
        ...state.currentDraft,
        ...updates,
        lastSavedAt: new Date().toISOString(),
      };
      return { currentDraft: updated };
    }),

  resetCurrentDraft: () =>
    set({
      currentDraft: { ...defaultDraft, id: `draft-${Date.now()}` },
    }),

  toggleSocialAccount: (platform) =>
    set((state) => ({
      socialAccounts: state.socialAccounts.map((acc) =>
        acc.platform === platform ? { ...acc, connected: !acc.connected } : acc,
      ),
    })),

  publishPostNow: async (postId) => {
    const post = get().posts.find((p) => p.id === postId);
    if (!post) return false;

    const results = await socialMediaService.publishPost(post);
    const allSuccessful = results.every((r) => r.success);

    if (allSuccessful) {
      get().updatePost(postId, {
        status: 'published',
        publishedAt: new Date().toISOString(),
        stats: {
          likes: Math.floor(Math.random() * 80) + 10,
          comments: Math.floor(Math.random() * 15) + 2,
          shares: Math.floor(Math.random() * 10) + 1,
          views: Math.floor(Math.random() * 600) + 100,
        },
      });

      const notification: AppNotification = {
        id: `notif-${Date.now()}`,
        title: 'Post Published Successfully! 🎉',
        body: `"${post.title}" is now live on ${post.platforms.join(', ')}.`,
        timestamp: 'Just now',
        type: 'publish_success',
        read: false,
      };

      set((state) => ({ notifications: [notification, ...state.notifications] }));
      await notificationService.sendInstantNotification(
        notification.title,
        notification.body,
      );
      return true;
    } else {
      get().updatePost(postId, { status: 'failed' });
      const notification: AppNotification = {
        id: `notif-${Date.now()}`,
        title: 'Publishing Alert',
        body: `Failed to publish "${post.title}". Check platform limits.`,
        timestamp: 'Just now',
        type: 'publish_failed',
        read: false,
      };
      set((state) => ({ notifications: [notification, ...state.notifications] }));
      return false;
    }
  },

  schedulePost: async (postData, scheduledDate) => {
    const newId = `post-${Date.now()}`;
    const newPost: Post = {
      ...postData,
      id: newId,
      status: 'scheduled',
      scheduledFor: scheduledDate.toISOString(),
      isDemo: get().isDemoMode,
    };

    set((state) => ({
      posts: [newPost, ...state.posts],
    }));

    // Schedule local notification
    await notificationService.schedulePostNotification(
      newPost.title,
      scheduledDate,
      newPost.platforms,
    );

    const notification: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Post Scheduled 📅',
      body: `"${newPost.title}" scheduled for ${scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      timestamp: 'Just now',
      type: 'schedule',
      read: false,
    };

    set((state) => ({
      notifications: [notification, ...state.notifications],
    }));

    return newId;
  },

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    })),
}));
