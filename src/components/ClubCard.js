import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import AppIcon from './AppIcon';
import { colors, radii, spacing, typography } from '../theme';

export default function ClubCard({ club, onPress }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.card}>
      {club.imageUrl ? (
        <Image source={{ uri: club.imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <AppIcon color={colors.primary} name="clubs" size={30} />
        </View>
      )}
      <Text numberOfLines={1} style={styles.name}>{club.name}</Text>
      <Text style={styles.category}>{club.category}</Text>
      <Text numberOfLines={2} style={styles.description}>{club.description}</Text>
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
  imagePlaceholder: {
    alignItems: 'center',
    backgroundColor: '#E8EEF7',
    borderRadius: radii.md,
    height: 82,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
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
  description: {
    color: colors.secondaryText,
    marginTop: spacing.sm,
    ...typography.caption,
  },
});
