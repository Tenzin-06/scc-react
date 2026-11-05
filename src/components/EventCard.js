import { Pressable, StyleSheet, Text, View } from 'react-native';

import AppIcon from './AppIcon';
import BookmarkButton from './BookmarkButton';
import { colors, radii, spacing, typography } from '../theme';

export default function EventCard({ event, onMenu, onPress, bookmarked, bookmarkLoading, onBookmark }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.card}>
      <View style={styles.dateBox}>
        <AppIcon color={colors.primary} name="events" size={22} />
        <Text style={styles.date}>{event.date}</Text>
      </View>
      <View style={styles.details}>
        <Text numberOfLines={1} style={styles.title}>{event.title}</Text>
        <Text style={styles.meta}>{event.time}  •  {event.location}</Text>
        <Text style={styles.club}>{event.clubName}</Text>
      </View>
      {onMenu ? <Pressable accessibilityLabel={`Actions for ${event.title}`} onPress={(pressEvent) => { pressEvent.stopPropagation(); onMenu(); }} style={styles.menuButton}><AppIcon color={colors.text} name="menu" size={18} /></Pressable> : null}
      {onBookmark ? <View style={styles.bookmarkButton}><BookmarkButton bookmarked={bookmarked} disabled={bookmarkLoading} label="event" onPress={onBookmark} /></View> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  dateBox: {
    alignItems: 'center',
    backgroundColor: '#E8EEF7',
    borderRadius: radii.sm,
    justifyContent: 'center',
    minHeight: 58,
    padding: spacing.sm,
    width: 70,
  },
  date: {
    color: colors.primary,
    marginTop: spacing.xs,
    textAlign: 'center',
    ...typography.caption,
  },
  details: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    color: colors.text,
    ...typography.cardTitle,
  },
  meta: {
    color: colors.secondaryText,
    marginTop: spacing.xs,
    ...typography.caption,
  },
  club: {
    color: colors.primary,
    marginTop: spacing.xs,
    ...typography.caption,
  },
  menuButton: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, elevation: 2, height: 32, justifyContent: 'center', width: 32 },
  bookmarkButton: { marginLeft: spacing.sm },
});
