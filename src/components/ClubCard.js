import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import AppIcon from './AppIcon';
import BookmarkButton from './BookmarkButton';
import { colors, radii, spacing, typography } from '../theme';

export default function ClubCard({ club, compact = false, onMenu, onPress, bookmarked, bookmarkLoading, onBookmark }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.card, compact && styles.compactCard]}>
      <View style={[styles.imageContainer, compact && styles.compactImageContainer]}>
        {club.imageUrl ? (
          <Image source={{ uri: club.imageUrl }} style={[styles.image, compact && styles.compactImage]} />
        ) : (
          <View style={[styles.imagePlaceholder, compact && styles.compactImage]}>
            <AppIcon color={colors.primary} name="clubs" size={30} />
          </View>
        )}
        {onMenu ? (
          <Pressable accessibilityLabel={`Actions for ${club.name}`} onPress={(event) => { event.stopPropagation(); onMenu(); }} style={styles.menuButton}>
            <AppIcon color={colors.text} name="menu" size={18} />
          </Pressable>
        ) : null}
        {onBookmark ? <View style={styles.bookmarkButton}><BookmarkButton bookmarked={bookmarked} disabled={bookmarkLoading} label="club" onPress={onBookmark} /></View> : null}
      </View>
      <View style={compact && styles.compactDetails}>
        <Text numberOfLines={1} style={styles.name}>{club.name}</Text>
        <Text style={styles.category}>{club.category || 'Student club'}</Text>
        <Text style={styles.members}>{club.memberCount || 0} Members</Text>
        <Text numberOfLines={compact ? 2 : 2} style={styles.description}>{club.description}</Text>
        {compact ? <View style={styles.viewClub}><Text style={styles.viewClubText}>View Club</Text><Text style={styles.arrow}>›</Text></View> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.card,
    borderWidth: 1,
    marginRight: spacing.md,
    padding: spacing.md,
    width: 190,
  },
  compactCard: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    marginRight: 0,
    padding: spacing.sm,
    width: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
    backgroundColor: '#E8EEF7',
    borderRadius: radii.md,
    height: 82,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  imageContainer: {
    position: 'relative',
  },
  compactImageContainer: { alignSelf: 'flex-start', marginRight: spacing.md },
  compactImage: { height: 72, marginBottom: 0, width: 72 },
  compactDetails: { flex: 1, minWidth: 0 },
  menuButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    elevation: 2,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
    width: 32,
  },
  bookmarkButton: { position: 'absolute', left: spacing.sm, top: spacing.sm },
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
  members: { color: colors.primary, fontSize: 10, marginTop: 2 },
  description: {
    color: colors.secondaryText,
    marginTop: spacing.sm,
    ...typography.caption,
  },
  viewClub: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  viewClubText: { color: colors.primary, fontSize: 11, fontWeight: '600' },
  arrow: { color: colors.primary, fontSize: 18, lineHeight: 12 },
});
