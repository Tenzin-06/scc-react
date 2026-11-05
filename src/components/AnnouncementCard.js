import { Pressable, StyleSheet, Text, View } from 'react-native';

import AppIcon from './AppIcon';
import { colors, componentStyles, radii, spacing, typography } from '../theme';
import { getAnnouncementDate } from '../utils/announcementDate';

export default function AnnouncementCard({ announcement, onMenu, onPress }) {
  return (
    <Pressable accessibilityRole="button" disabled={!onPress} onPress={onPress} style={({ pressed }) => [styles.card, pressed && onPress && styles.pressed]}>
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
    ...componentStyles.card,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: colors.background,
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
  menuButton: { ...componentStyles.iconButton, borderRadius: radii.md },
  pressed: componentStyles.pressed,
});
