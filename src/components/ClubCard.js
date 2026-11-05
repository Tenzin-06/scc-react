import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import AppIcon from './AppIcon';
import BookmarkButton from './BookmarkButton';
import { colors, componentStyles, radii, spacing, typography } from '../theme';

export default function ClubCard({ club, compact = false, metadataLabel, metadataValue, onMenu, onPress, bookmarked, bookmarkLoading, onBookmark }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, compact && styles.compactCard, pressed && onPress && styles.pressed]}>
      <View style={[styles.imageContainer, compact && styles.compactImageContainer]}>
        {club.imageUrl ? (
          <Image source={{ uri: club.imageUrl }} style={[styles.image, compact && styles.compactImage]} />
        ) : (
          <View style={[styles.imagePlaceholder, compact && styles.compactImage]}>
            <AppIcon color={colors.primary} name="clubs" size={30} />
          </View>
        )}
      </View>
      <View style={compact && styles.compactDetails}>
        <View style={compact && styles.detailsHeader}>
          <Text numberOfLines={1} style={[styles.name, compact && styles.compactName]}>{club.name}</Text>
          {compact && (onMenu || onBookmark) ? (
            <View style={styles.actions}>
              {onBookmark ? <BookmarkButton bookmarked={bookmarked} disabled={bookmarkLoading} label="club" onPress={onBookmark} /> : null}
              {onMenu ? (
                <Pressable accessibilityLabel={`Actions for ${club.name}`} accessibilityRole="button" onPress={(event) => { event.stopPropagation(); onMenu(); }} style={({ pressed }) => [styles.menuButton, pressed && styles.actionPressed]}>
                  <AppIcon color={colors.text} name="menu" size={18} />
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>
        <Text numberOfLines={1} style={styles.category}>{club.category || 'Student club'}</Text>
        <View style={styles.memberCount}>
          <AppIcon color={colors.primary} name="clubs" size={13} />
          <Text style={styles.members}>{club.memberCount || 0} members</Text>
        </View>
        <Text numberOfLines={compact ? 2 : 2} style={styles.description}>{club.description}</Text>
        {metadataLabel && metadataValue ? (
          <View style={styles.metadata}>
            <Text style={styles.metadataLabel}>{metadataLabel}</Text>
            <Text numberOfLines={1} style={styles.metadataValue}>{metadataValue}</Text>
          </View>
        ) : null}
        {compact && onPress ? <View style={styles.viewClub}><Text style={styles.viewClubText}>View club</Text><Text style={styles.arrow}>›</Text></View> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    ...componentStyles.card,
    marginRight: spacing.md,
    padding: spacing.md,
    width: 190,
  },
  compactCard: {
    ...componentStyles.compactCard,
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
    marginRight: 0,
    padding: spacing.md,
    width: '100%',
  },
  imagePlaceholder: {
    ...componentStyles.mediaPlaceholder,
    height: 82,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  imageContainer: {},
  compactImageContainer: { marginRight: spacing.md },
  compactImage: { borderRadius: radii.md, height: 84, marginBottom: 0, width: 84 },
  compactDetails: { flex: 1, minWidth: 0 },
  menuButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  detailsHeader: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs },
  compactName: { flex: 1, minWidth: 0 },
  actions: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs },
  actionPressed: componentStyles.pressed,
  image: {
    borderRadius: radii.md,
    height: 82,
    marginBottom: spacing.md,
    width: '100%',
  },
  name: {
    color: colors.text,
    ...typography.cardTitle,
  },
  category: {
    color: colors.primary,
    marginTop: spacing.xs,
    ...typography.caption,
  },
  memberCount: {
    alignSelf: 'flex-start',
    backgroundColor: colors.chip,
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  members: { color: colors.dark, ...typography.caption },
  description: {
    color: colors.secondaryText,
    marginTop: spacing.sm,
    ...typography.caption,
  },
  metadata: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  metadataLabel: { color: colors.secondaryText, ...typography.caption },
  metadataValue: { color: colors.dark, flex: 1, ...typography.caption },
  viewClub: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
  },
  viewClubText: { color: colors.primary, ...typography.label },
  arrow: { color: colors.primary, fontSize: 19, lineHeight: 20 },
  pressed: componentStyles.pressed,
});
