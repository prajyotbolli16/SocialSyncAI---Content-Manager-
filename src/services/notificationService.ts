import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Safely configure how notifications appear when app is in foreground
try {
  if (typeof Notifications?.setNotificationHandler === 'function') {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }
} catch (e) {
  console.warn('Unable to set notification handler:', (e as Error).message);
}

class NotificationService {
  private hasPermission = false;

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return false;

    try {
      if (typeof Notifications?.getPermissionsAsync !== 'function') {
        return false;
      }
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted' && typeof Notifications?.requestPermissionsAsync === 'function') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      this.hasPermission = finalStatus === 'granted';
      return this.hasPermission;
    } catch {
      return false;
    }
  }

  /**
   * Schedule a local notification for an upcoming post.
   */
  async schedulePostNotification(
    title: string,
    scheduledDate: Date,
    platforms: string[],
  ): Promise<string | null> {
    try {
      if (typeof Notifications?.scheduleNotificationAsync !== 'function') {
        return null;
      }

      const targetSeconds = Math.max(
        Math.floor((scheduledDate.getTime() - Date.now()) / 1000),
        5, // at least 5 seconds from now if in past or immediate
      );

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚀 Post Scheduled for Publishing',
          body: `"${title}" is going live on ${platforms.join(', ')}.`,
          data: { type: 'scheduled_post', title },
        },
        trigger: {
          seconds: targetSeconds,
        },
      });

      return id;
    } catch {
      return null;
    }
  }

  /**
   * Send an immediate local notification (e.g., publishing success or fatigue alert).
   */
  async sendInstantNotification(title: string, body: string): Promise<void> {
    try {
      if (typeof Notifications?.scheduleNotificationAsync !== 'function') {
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
        },
        trigger: null, // immediately
      });
    } catch {
      // safe fallback if notifications are disabled
    }
  }
}

export const notificationService = new NotificationService();
