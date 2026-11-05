import { Pressable, StyleSheet, Text, View } from 'react-native';

import AppIcon from './AppIcon';
import { colors, radii, spacing, typography } from '../theme';
import { getAnnouncementDate } from '../utils/announcementDate';

export default function AnnouncementCard({ announcement, onMenu, onPress }) {
  return (
    <Pressable accessibilityRole="button" disabled={!onPress} onPress={onPress} style={styles.card}>
      <View style={styles.icon}>
        <AppIcon color={colors.primary} name="bell" size={18} />
      </View>
      <View style={styles.details}>
        <Text numberOfLines={1} style={styles.title}>{announcement.title}</Text>
        <Text numberOfLines={2} style={styles.message}>{announcement.message}</Text>
        <Text style={styles.meta}>
          {announcement.clubName || 'General announcement'}  •  {announcement.date || getAnnouncementDate(announcement.createdAt)}
        </Text>
      </View>
      {onMenu ? <Pressable accessibilityLabel={`Actions for ${announcement.title}`} onPress={(pressEvent) => { pressEvent.stopPropagation(); onMenu(); }} style={styles.menuButton}><AppIcon color={colors.text} name="menu" size={18} /></Pressable> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: '#E8EEF7',
    borderRadius: radii.sm,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  details: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    color: colors.text,
    ...typography.cardTitle,
  },
  message: {
    color: colors.secondaryText,
    marginTop: spacing.xs,
    ...typography.caption,
  },
  meta: {
    color: colors.secondaryText,
    marginTop: spacing.xs,
    ...typography.caption,
  },
  menuButton: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, elevation: 2, height: 32, justifyContent: 'center', width: 32 },
});
