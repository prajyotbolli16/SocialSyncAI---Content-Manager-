# SocialSync AI 🚀

A mobile application for Android and iOS built with **React Native**, **Expo (SDK 57)**, **TypeScript**, **Supabase**, and **Zustand**.

---

## 🎨 Design System

- **Theme**: Premium dark theme (`#0F1216` background, `#181C22` rounded cards) with **Vibrant Teal** (`#00BFA5`) and **Purple** (`#9D65FF`) accents.
- **Component Library**: React Native Paper (MD3) + Lucide React Native icons.
- **Navigation**: Bottom Tab Navigation — **Home**, **Create**, **Calendar**, **Insights**, **Profile**.

---

## ✨ Features Implemented

1. **Dashboard (`HomeScreen`)**:
   - Real-time post statistics (scheduled count, drafts count, aggregate engagement rate).
   - Upcoming queue with multi-platform tags and **instant "Publish Now"** simulator.
   - Channel connectivity status cards with follower counts.
   - Quick navigation shortcuts to Calendar, Insights, and AI Studio.

2. **AI Content Studio (`CreateScreen`)**:
   - Post ideation prompt input with multi-tone selector (*Engaging*, *Professional*, *Casual*, *Educational*, *Promotional*).
   - Target network selector (*Instagram*, *LinkedIn*, *X*, *Facebook*, *YouTube*).
   - AI draft generator with custom opening hooks, captions, and hashtag suggestions.
   - Media attachment using `expo-image-picker` with image preview and delete controls.
   - Real-time character counter with per-platform limit warnings (e.g. X 280-char rule).
   - Background **Draft Autosave** with timestamp indicator.
   - Schedule modal with AI-recommended peak slots and instant local notifications.

3. **Content Calendar (`CalendarScreen`)**:
   - Interactive weekly/monthly calendar view.
   - Scheduled post cards with platform badges.
   - Reschedule modal (+1 day, +2 days, +1 week) with automatic notification rescheduling.
   - Platform filter chips (*All*, *Instagram*, *LinkedIn*, *X*, *Facebook*, *YouTube*).
   - Post cancellation and deletion controls.

4. **Analytics Dashboard (`InsightsScreen` - Tab 1)**:
   - High-level metric grid: Impressions/Views, Engagement Rate, Likes, Shares.
   - Weekly engagement velocity bar chart.
   - Top-performing posts ranking (#1, #2, #3).

5. **Engagement Feedback Insights (`InsightsScreen` - Tab 2)**:
   - Interaction ratio analysis: Comment rate and Share/Save virality indicators.
   - AI-generated engagement recommendations and prioritized action checklists.

6. **Content Fatigue Detector (`InsightsScreen` - Tab 3)**:
   - Repetition score (0–100%) and fatigue level indicator (*Low*, *Moderate*, *High*).
   - Detection of overused hashtags and repetitive topic angles in queue.
   - AI suggestions for fresh alternative topics.

7. **Audience Fatigue Monitoring (`InsightsScreen` - Tab 3)**:
   - Early detection of sustained engagement drops.
   - Burnout risk assessment (*Healthy* vs *Caution*).
   - Recommended content experiments (*Interactive Polls*, *Contrarian Hooks*, *Short-form Video*).

8. **Social Media Integrations & Profile (`ProfileScreen`)**:
   - Connection status and sandbox toggles for Instagram, LinkedIn, X, Facebook, and YouTube.
   - Platform-specific limits and validation rules.
   - Demo & Simulation Mode toggle switch.
   - Supabase user account view and secure sign-out.

9. **Notifications & Feedback**:
   - Integrated with `expo-notifications` for scheduled post alerts.
   - In-app snackbars and status indicators.

---

## 🔒 Security Architecture

- **Zero-Secret Client Policy**: The Supabase service-role key (`SUPABASE_SERVICE_ROLE_KEY`) and `OPENAI_API_KEY` reside exclusively in server-side Edge Functions (`supabase/functions/*`).
- **Encrypted Session Persistence**: Client uses `expo-secure-store` on iOS and Android to securely store Supabase session tokens.
- **Safe Fallback & Demo Mode**: If `.env` credentials are not present, the app automatically runs in Demo Mode with realistic data and simulated publishing.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v20+ or v24+)
- npm or npx
- Expo Go on iOS/Android or an emulator

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables (Optional for Demo Mode)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Supabase project URL and public anon key:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run the App
```bash
# Start Expo development server
npx expo start

# Run on Android
npx expo start --android

# Run on iOS
npx expo start --ios

# Run on Web
npx expo start --web
```

### 5. Run Tests
```bash
npm test
```

### 6. Diagnose Environment
```bash
npx expo-doctor
```

---

## 🗄️ Supabase Backend

### Database Migrations
PostgreSQL migration file with Row-Level Security (RLS) is located at:
`supabase/migrations/20261015000000_init.sql`

Apply to your Supabase project:
```bash
npx supabase db push
```

### Edge Functions
Located in `supabase/functions/`:
- `generate-content`: Server-side OpenAI caption generation with secure server environment variables.
- `schedule-post`: Post queue insertion with authorization validation.
- `analyze-fatigue`: Server-side audience drop and fatigue computation.

Deploy edge functions:
```bash
npx supabase functions deploy generate-content
npx supabase functions deploy schedule-post
npx supabase functions deploy analyze-fatigue
```
