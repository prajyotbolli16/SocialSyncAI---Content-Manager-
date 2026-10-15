export type SocialPlatform = 'Instagram' | 'Facebook' | 'LinkedIn' | 'YouTube' | 'X';

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export interface Post {
  id: string;
  title: string;
  content: string;
  platforms: SocialPlatform[];
  mediaUri?: string;
  hashtags: string[];
  scheduledFor?: string; // ISO date string
  publishedAt?: string;
  status: PostStatus;
  stats?: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  isDemo?: boolean;
}

export interface Draft {
  id: string;
  idea: string;
  content: string;
  hashtags: string[];
  platforms: SocialPlatform[];
  mediaUri?: string;
  tone: 'Professional' | 'Casual' | 'Engaging' | 'Educational' | 'Promotional';
  lastSavedAt: string;
}

export interface SocialAccount {
  platform: SocialPlatform;
  connected: boolean;
  handle: string;
  name: string;
  followers: number;
  isMock: boolean;
}

export interface DailyEngagement {
  day: string; // e.g. "Mon", "Tue"
  views: number;
  engagement: number; // percentage e.g. 4.2
}

export interface ContentFatigueReport {
  score: number; // 0-100
  level: 'Low' | 'Moderate' | 'High';
  repetitiveTopics: string[];
  overusedHashtags: string[];
  recommendations: string[];
  freshAngles: string[];
}

export interface AudienceFatigueReport {
  score: number; // 0-100
  trend: 'Growing' | 'Stable' | 'Declining';
  dropPercentage: number;
  warningSignals: string[];
  recommendedExperiments: string[];
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: 'schedule' | 'publish_success' | 'publish_failed' | 'ai_insight';
  read: boolean;
}
