import type {
  Post,
  Draft,
  SocialAccount,
  ContentFatigueReport,
  AudienceFatigueReport,
  DailyEngagement,
  AppNotification,
} from '../types';

export const INITIAL_SOCIAL_ACCOUNTS: SocialAccount[] = [
  {
    platform: 'Instagram',
    connected: true,
    handle: '@socialsync.ai',
    name: 'SocialSync Studio',
    followers: 14200,
    isMock: true,
  },
  {
    platform: 'LinkedIn',
    connected: true,
    handle: 'SocialSync AI',
    name: 'SocialSync Company',
    followers: 8650,
    isMock: true,
  },
  {
    platform: 'X',
    connected: true,
    handle: '@SocialSyncApp',
    name: 'SocialSync',
    followers: 19400,
    isMock: true,
  },
  {
    platform: 'Facebook',
    connected: false,
    handle: 'SocialSyncApp',
    name: 'SocialSync Page',
    followers: 5200,
    isMock: true,
  },
  {
    platform: 'YouTube',
    connected: false,
    handle: '@SocialSyncAI',
    name: 'SocialSync AI Channel',
    followers: 3100,
    isMock: true,
  },
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'demo-p1',
    title: 'Product launch teaser: AI Workflow Automation',
    content:
      'We are revolutionizing how creators manage their digital footprints. Automate, schedule, and eliminate content fatigue with SocialSync AI. Full walkthrough dropping soon! 🚀✨',
    platforms: ['Instagram', 'X'],
    hashtags: ['#AIAutomation', '#ContentCreation', '#SocialMediaGrowth', '#TechTrends'],
    scheduledFor: new Date(Date.now() + 3600 * 4000).toISOString(), // ~4 hours from now
    status: 'scheduled',
    isDemo: true,
  },
  {
    id: 'demo-p2',
    title: 'Behind the Scenes: How our AI detects audience burnout',
    content:
      'Did you know that posting similar hooks 3 days in a row leads to an average 38% decrease in comment volume? Here is how our fatigue monitor keeps your audience energized.',
    platforms: ['LinkedIn'],
    hashtags: ['#AudienceRetention', '#ContentStrategy', '#B2BMarketing', '#SocialSync'],
    scheduledFor: new Date(Date.now() + 86400 * 1000 * 2).toISOString(), // in 2 days
    status: 'scheduled',
    isDemo: true,
  },
  {
    id: 'demo-p3',
    title: 'Friday Community Q&A & Workflow Breakdown',
    content:
      'Happy Friday! What is your biggest challenge with daily social media management? Drop your questions below, and our creators will answer the top 5 in this thread.',
    platforms: ['X', 'LinkedIn'],
    hashtags: ['#CreatorEconomy', '#CommunityFirst', '#FridayFocus'],
    scheduledFor: new Date(Date.now() + 86400 * 1000 * 4).toISOString(), // in 4 days
    status: 'scheduled',
    isDemo: true,
  },
  {
    id: 'demo-p4',
    title: '5 Habits of High-Performing Modern Social Managers',
    content:
      '1. Review fatigue alerts weekly\n2. Batch caption ideation\n3. Repurpose long-form into bite-sized clips\n4. Engage in comments for the first 30 mins\n5. Test new formats before engagement declines.',
    platforms: ['LinkedIn', 'Instagram'],
    hashtags: ['#MarketingTips', '#GrowthMindset', '#Productivity'],
    publishedAt: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
    status: 'published',
    stats: {
      likes: 1240,
      comments: 94,
      shares: 182,
      views: 18400,
    },
    isDemo: true,
  },
  {
    id: 'demo-p5',
    title: 'AI vs Traditional Content Scheduling: The Showdown',
    content:
      'Traditional schedulers only post blindly. SocialSync monitors fatigue, tunes timing, and suggests fresh angles before your reach drops. Watch our quick demo comparison!',
    platforms: ['X'],
    hashtags: ['#SocialMediaTools', '#AI', '#SaaS'],
    publishedAt: new Date(Date.now() - 86400 * 1000 * 4).toISOString(),
    status: 'published',
    stats: {
      likes: 890,
      comments: 63,
      shares: 110,
      views: 12800,
    },
    isDemo: true,
  },
];

export const INITIAL_DRAFTS: Draft[] = [
  {
    id: 'demo-d1',
    idea: 'Explain difference between content fatigue and audience fatigue',
    content:
      'Content Fatigue is when YOU run out of ideas or repeat the same topics. Audience Fatigue is when YOUR FOLLOWERS tune out because your formats feel stale. Here is how to fix both simultaneously.',
    hashtags: ['#ContentMarketing', '#SocialStrategy', '#AudienceInsights'],
    platforms: ['LinkedIn', 'X'],
    tone: 'Educational',
    lastSavedAt: new Date().toISOString(),
  },
];

export const INITIAL_DAILY_ENGAGEMENT: DailyEngagement[] = [
  { day: 'Mon', views: 3200, engagement: 4.8 },
  { day: 'Tue', views: 4100, engagement: 5.2 },
  { day: 'Wed', views: 2900, engagement: 3.9 },
  { day: 'Thu', views: 4800, engagement: 5.6 },
  { day: 'Fri', views: 3900, engagement: 4.5 },
  { day: 'Sat', views: 2100, engagement: 3.2 },
  { day: 'Sun', views: 3400, engagement: 4.1 },
];

export const INITIAL_CONTENT_FATIGUE: ContentFatigueReport = {
  score: 38,
  level: 'Moderate',
  repetitiveTopics: [
    'Feature Announcements (3x this week)',
    'AI tool productivity stats (4x this month)',
  ],
  overusedHashtags: ['#AIAutomation', '#ContentCreation', '#GrowthMindset'],
  recommendations: [
    'Introduce a counter-intuitive industry critique or myth-busting post.',
    'Switch from carousel graphics to direct conversational text prompts.',
    'Rotate hashtags: Replace #AIAutomation with niche tags like #WorkflowEfficiency or #NoCodeTools.',
  ],
  freshAngles: [
    '"What nobody tells you about automated social distribution"',
    '"3 social media metrics you should stop tracking in 2026"',
    '"Behind the design: Why we chose purple and teal accents for dark mode"',
  ],
};

export const INITIAL_AUDIENCE_FATIGUE: AudienceFatigueReport = {
  score: 24,
  trend: 'Stable',
  dropPercentage: 6.4,
  warningSignals: [
    'Save-to-impression ratio dropped by 8% over last 14 days on Instagram.',
    'LinkedIn comment threads are 15% shorter than last month.',
  ],
  recommendedExperiments: [
    'Experiment 1: Post an open-ended provocative question on Tuesday morning.',
    'Experiment 2: Try a 60-second video demo rather than static image slides.',
    'Experiment 3: Run a live Q&A poll directly on X to re-activate passive followers.',
  ],
};

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: 'Post Scheduled Successfully',
    body: '"Product launch teaser" is queued for Instagram & X at 4:30 PM.',
    timestamp: '10 mins ago',
    type: 'schedule',
    read: false,
  },
  {
    id: 'n2',
    title: 'Fatigue Insight Alert',
    body: 'Detected 3 repetitive hashtags in your recent queue. Check recommendations.',
    timestamp: '2 hours ago',
    type: 'ai_insight',
    read: false,
  },
  {
    id: 'n3',
    title: 'Milestone Reached! 🎉',
    body: 'Your LinkedIn post reached 18.4K impressions, beating 85% of past posts.',
    timestamp: '1 day ago',
    type: 'publish_success',
    read: true,
  },
];
