import type { SocialPlatform, Post } from '../types';

export interface PublishResult {
  success: boolean;
  platform: SocialPlatform;
  postId?: string;
  postUrl?: string;
  error?: string;
  isSimulated: boolean;
  publishedAt: string;
}

export interface PlatformConfig {
  maxCharacters: number;
  supportsImages: boolean;
  supportsVideo: boolean;
  hasTagging: boolean;
  authRequiredScope: string[];
}

export const PLATFORM_LIMITS: Record<SocialPlatform, PlatformConfig> = {
  Instagram: {
    maxCharacters: 2200,
    supportsImages: true,
    supportsVideo: true,
    hasTagging: true,
    authRequiredScope: ['instagram_basic', 'instagram_content_publish'],
  },
  Facebook: {
    maxCharacters: 63206,
    supportsImages: true,
    supportsVideo: true,
    hasTagging: true,
    authRequiredScope: ['pages_manage_posts', 'pages_read_engagement'],
  },
  LinkedIn: {
    maxCharacters: 3000,
    supportsImages: true,
    supportsVideo: true,
    hasTagging: true,
    authRequiredScope: ['w_member_social', 'r_basicprofile'],
  },
  YouTube: {
    maxCharacters: 5000,
    supportsImages: false,
    supportsVideo: true,
    hasTagging: true,
    authRequiredScope: ['https://www.googleapis.com/auth/youtube.upload'],
  },
  X: {
    maxCharacters: 280,
    supportsImages: true,
    supportsVideo: true,
    hasTagging: true,
    authRequiredScope: ['tweet.read', 'tweet.write', 'users.read'],
  },
};

class SocialMediaService {
  /**
   * Validates a post content against platform character limits and media rules.
   */
  validatePost(post: { content: string; platforms: SocialPlatform[]; mediaUri?: string }): {
    isValid: boolean;
    errors: Record<string, string>;
  } {
    const errors: Record<string, string> = {};

    for (const platform of post.platforms) {
      const config = PLATFORM_LIMITS[platform];
      if (post.content.length > config.maxCharacters) {
        errors[platform] = `${platform} max length is ${config.maxCharacters} characters (current: ${post.content.length}).`;
      }
      if (platform === 'YouTube' && !post.mediaUri) {
        errors[platform] = 'YouTube requires a video attachment.';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Simulates publishing to one or multiple platforms.
   * Can be swapped with official OAuth REST APIs when credentials are provided.
   */
  async publishPost(
    post: Post,
    targetPlatforms?: SocialPlatform[],
  ): Promise<PublishResult[]> {
    const platformsToPublish = targetPlatforms || post.platforms;
    const results: PublishResult[] = [];

    // Simulate realistic asynchronous network call
    await new Promise((resolve) => setTimeout(resolve, 800));

    for (const platform of platformsToPublish) {
      const config = PLATFORM_LIMITS[platform];

      if (post.content.length > config.maxCharacters) {
        results.push({
          success: false,
          platform,
          error: `Exceeded character limit of ${config.maxCharacters}`,
          isSimulated: true,
          publishedAt: new Date().toISOString(),
        });
        continue;
      }

      // Simulated success with mock generated ID and URL
      const mockId = `${platform.toLowerCase()}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      results.push({
        success: true,
        platform,
        postId: mockId,
        postUrl: `https://${platform.toLowerCase()}.com/mock_post/${mockId}`,
        isSimulated: true,
        publishedAt: new Date().toISOString(),
      });
    }

    return results;
  }
}

export const socialMediaService = new SocialMediaService();
