import { Pressable, StyleSheet, Text, View } from 'react-native';

import AppIcon from './AppIcon';
import BookmarkButton from './BookmarkButton';
import { colors, componentStyles, radii, spacing, typography } from '../theme';

export default function EventCard({ event, onMenu, onPress, bookmarked, bookmarkLoading, onBookmark, onRegister, registered, registering }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, onRegister && styles.studentCard, pressed && onPress && styles.pressed]}>
      <View style={styles.contentRow}>
        <View style={styles.dateBox}>
          <AppIcon color={colors.primary} name="events" size={22} />
          <Text numberOfLines={2} style={styles.date}>{event.date}</Text>
        </View>
        <View style={styles.details}>
          <Text numberOfLines={1} style={styles.title}>{event.title}</Text>
          <Text numberOfLines={1} style={styles.meta}>{event.time} | {event.location}</Text>
          <Text numberOfLines={1} style={styles.club}>{event.clubName}</Text>
        </View>
        {onMenu ? <Pressable accessibilityLabel={`Actions for ${event.title}`} onPress={(pressEvent) => { pressEvent.stopPropagation(); onMenu(); }} style={styles.menuButton}><AppIcon color={colors.text} name="menu" size={18} /></Pressable> : null}
        {onBookmark ? <View style={styles.bookmarkButton}><BookmarkButton bookmarked={bookmarked} disabled={bookmarkLoading} label="event" onPress={onBookmark} /></View> : null}
      </View>
      {onRegister ? (
        <Pressable accessibilityRole="button" disabled={registering} onPress={(pressEvent) => { pressEvent.stopPropagation(); onRegister(); }} style={({ pressed }) => [styles.registerButton, registered && styles.registeredButton, pressed && !registering && styles.pressed]}>
          <Text style={[styles.registerText, registered && styles.registeredText]}>{registering ? 'Please wait' : registered ? 'Registered' : 'Register'}</Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { ...componentStyles.card, alignItems: 'center', flexDirection: 'row', marginBottom: spacing.sm, padding: spacing.md },
  studentCard: { alignItems: 'stretch', flexDirection: 'column', padding: spacing.md },
  contentRow: { alignItems: 'center', flexDirection: 'row', width: '100%' },
  dateBox: { alignItems: 'center', backgroundColor: colors.background, borderRadius: radii.sm, justifyContent: 'center', minHeight: 58, padding: spacing.sm, width: 70 },
  date: { color: colors.primary, marginTop: spacing.xs, textAlign: 'center', ...typography.caption },
  details: { flex: 1, marginLeft: spacing.md, minWidth: 0 },
  title: { color: colors.text, ...typography.cardTitle },
  meta: { color: colors.secondaryText, marginTop: spacing.xs, ...typography.caption },
  club: { color: colors.primary, marginTop: spacing.xs, ...typography.caption },
  menuButton: { ...componentStyles.iconButton, borderRadius: radii.md },
  bookmarkButton: { marginLeft: spacing.sm },
  registerButton: { alignItems: 'center', borderColor: colors.primary, borderRadius: radii.sm, borderWidth: 1, justifyContent: 'center', marginTop: spacing.sm, minHeight: 40, paddingHorizontal: spacing.sm, width: '100%' },
  registeredButton: { backgroundColor: colors.primary },
  registerText: { color: colors.primary, ...typography.caption },
  registeredText: { color: colors.white },
  pressed: componentStyles.pressed,
});
