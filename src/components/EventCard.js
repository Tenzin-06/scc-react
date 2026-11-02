import { Pressable, StyleSheet, Text, View } from 'react-native';

import AppIcon from './AppIcon';
import { colors, radii, spacing, typography } from '../theme';

export default function EventCard({ event, onPress }) {
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
});
