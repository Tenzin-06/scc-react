import { StyleSheet, Text, View } from 'react-native';

import AppIcon from './AppIcon';
import { colors, radii, spacing, typography } from '../theme';

export default function AnnouncementCard({ announcement }) {
  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <AppIcon color={colors.primary} name="bell" size={18} />
      </View>
      <View style={styles.details}>
        <Text numberOfLines={1} style={styles.title}>{announcement.title}</Text>
        <Text numberOfLines={2} style={styles.message}>{announcement.message}</Text>
        <Text style={styles.meta}>{announcement.clubName}  •  {announcement.date}</Text>
      </View>
    </View>
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
});
