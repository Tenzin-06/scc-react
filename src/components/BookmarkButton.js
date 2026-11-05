import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { colors } from '../theme';

export default function BookmarkButton({ bookmarked, disabled, onPress, label = 'bookmark' }) {
  return (
    <Pressable
      accessibilityLabel={`${bookmarked ? 'Remove' : 'Add'} ${label} bookmark`}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected: bookmarked }}
      disabled={disabled}
      hitSlop={8}
      onPress={(event) => { event.stopPropagation(); onPress?.(); }}
      style={styles.button}
    >
      {disabled ? <ActivityIndicator color={colors.primary} size="small" /> : (
        <View style={[styles.mark, bookmarked && styles.filled]}>
          <View style={[styles.notch, bookmarked && styles.filledNotch]} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: 20, elevation: 2, height: 40, justifyContent: 'center', width: 40 },
  mark: { borderColor: colors.primary, borderRadius: 2, borderWidth: 1.8, height: 19, overflow: 'hidden', width: 15 },
  filled: { backgroundColor: colors.primary },
  notch: { backgroundColor: colors.surface, bottom: -5, height: 8, left: 2, position: 'absolute', transform: [{ rotate: '45deg' }], width: 8 },
  filledNotch: { backgroundColor: colors.surface },
});
