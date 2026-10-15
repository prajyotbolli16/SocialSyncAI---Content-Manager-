import { socialMediaService, PLATFORM_LIMITS } from '../src/services/socialMediaService';
import { fatigueService } from '../src/services/fatigueService';
import { aiStudioService } from '../src/services/aiStudioService';
import type { Post } from '../src/types';

describe('SocialSync AI Services Audit & Verification', () => {
  describe('SocialMediaService & Platform Limits', () => {
    it('should correctly define character limits for all platforms', () => {
      expect(PLATFORM_LIMITS.X.maxCharacters).toBe(280);
      expect(PLATFORM_LIMITS.Instagram.maxCharacters).toBe(2200);
      expect(PLATFORM_LIMITS.LinkedIn.maxCharacters).toBe(3000);
    });

    it('should catch character limit violations for X', () => {
      const longText = 'A'.repeat(300);
      const validation = socialMediaService.validatePost({
        content: longText,
        platforms: ['X'],
      });
      expect(validation.isValid).toBe(false);
      expect(validation.errors.X).toBeDefined();
    });

    it('should pass validation for valid posts', () => {
      const validText = 'Short announcement post for LinkedIn and Instagram.';
      const validation = socialMediaService.validatePost({
        content: validText,
        platforms: ['LinkedIn', 'Instagram'],
      });
      expect(validation.isValid).toBe(true);
    });

    it('should simulate publishing with realistic response format', async () => {
      const samplePost: Post = {
        id: 'test-1',
        title: 'Test Post',
        content: 'This is a test post content.',
        platforms: ['LinkedIn'],
        hashtags: ['#Test'],
        status: 'draft',
      };

      const results = await socialMediaService.publishPost(samplePost);
      expect(results.length).toBe(1);
      expect(results[0].success).toBe(true);
      expect(results[0].isSimulated).toBe(true);
      expect(results[0].postUrl).toContain('linkedin.com');
    });
  });

  describe('FatigueService', () => {
    it('should return low fatigue when post queue has distinct topics', () => {
      const samplePosts: Post[] = [
        {
          id: '1',
          title: 'Post 1',
          content: 'Excited to announce our new developer podcast!',
          platforms: ['X'],
          hashtags: ['#Podcast'],
          status: 'scheduled',
        },
      ];

      const report = fatigueService.analyzeContentFatigue(samplePosts);
      expect(report.score).toBeLessThanOrEqual(40);
      expect(report.recommendations.length).toBeGreaterThan(0);
    });

    it('should calculate engagement feedback ratios correctly', () => {
      const samplePosts: Post[] = [
        {
          id: '1',
          title: 'Published Post',
          content: 'Content',
          platforms: ['Instagram'],
          hashtags: [],
          status: 'published',
          stats: {
            likes: 100,
            comments: 20,
            shares: 10,
            views: 1000,
          },
        },
      ];

      const feedback = fatigueService.getEngagementFeedback(samplePosts);
      expect(feedback.totalViews).toBe(1000);
      expect(feedback.totalLikes).toBe(100);
      expect(feedback.commentRate).toBe('2.00%');
      expect(feedback.shareRate).toBe('1.00%');
    });
  });

  describe('AIStudioService', () => {
    it('should generate platform-optimized caption and hashtags', async () => {
      const res = await aiStudioService.generateDraft({
        idea: 'How to build habit consistency in 2026',
        tone: 'Educational',
        platforms: ['LinkedIn'],
      });

      expect(res.caption).toBeDefined();
      expect(res.caption.length).toBeGreaterThan(20);
      expect(res.hashtags.length).toBeGreaterThan(0);
      expect(res.alternativeHooks.length).toBeGreaterThan(0);
      expect(res.isMock).toBe(true);
    });
  });
});
