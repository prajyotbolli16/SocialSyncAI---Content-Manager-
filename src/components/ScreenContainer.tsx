import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Badge } from 'react-native-paper';
import { Bell, Sparkles } from 'lucide-react-native';
import { DarkTheme } from '../theme/customTheme';
import { useStore } from '../store/useStore';

type ScreenContainerProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  onNotificationPress?: () => void;
}>;

export function ScreenContainer({
  title,
  subtitle,
  action,
  children,
  onNotificationPress,
}: ScreenContainerProps) {
  const isDemoMode = useStore((state) => state.isDemoMode);
  const notifications = useStore((state) => state.notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
    >
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <View style={styles.demoBanner}>
          <Sparkles size={14} color="#70F7DC" />
          <Text style={styles.demoBannerText}>
            Demo Mode · All analytics, publishing & AI are simulated
          </Text>
        </View>
      )}

      {/* Screen Heading */}
      <View style={styles.headingRow}>
        <View style={{ flex: 1 }}>
          <Text variant="headlineMedium" style={styles.title}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="bodyMedium" style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          {action}
          {onNotificationPress && (
            <TouchableOpacity
              onPress={onNotificationPress}
              style={styles.bellButton}
              activeOpacity={0.7}
            >
              <Bell size={20} color={DarkTheme.colors.onSurface} />
              {unreadCount > 0 && (
                <Badge size={16} style={styles.notificationBadge}>
                  {unreadCount}
                </Badge>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {children}
    </ScrollView>
  );
}

export const screenStyles = StyleSheet.create({
  card: {
    backgroundColor: DarkTheme.colors.surface,
    borderColor: DarkTheme.colors.outline,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
  },
  cardHighlight: {
    backgroundColor: '#11292B',
    borderColor: '#005144',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    padding: 18,
  },
  eyebrow: {
    color: DarkTheme.colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  muted: {
    color: DarkTheme.colors.onSurfaceVariant,
    fontSize: 13,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: DarkTheme.colors.background,
    flex: 1,
  },
  content: {
    padding: 18,
    paddingTop: 12,
    paddingBottom: 36,
  },
  demoBanner: {
    alignItems: 'center',
    backgroundColor: '#0F2625',
    borderColor: '#005144',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  demoBannerText: {
    color: '#70F7DC',
    fontSize: 11,
    fontWeight: '600',
  },
  headingRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 6,
  },
  title: {
    color: DarkTheme.colors.onSurface,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: DarkTheme.colors.onSurfaceVariant,
    marginTop: 4,
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginLeft: 8,
  },
  bellButton: {
    alignItems: 'center',
    backgroundColor: DarkTheme.colors.surface,
    borderColor: DarkTheme.colors.outline,
    borderRadius: 12,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  notificationBadge: {
    backgroundColor: DarkTheme.colors.secondary,
    position: 'absolute',
    right: -2,
    top: -2,
  },
});
