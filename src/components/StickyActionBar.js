import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, componentStyles, spacing, typography } from '../theme';

export default function StickyActionBar({ disabled = false, loading = false, message, onPress, title }) {
  return (
    <View style={styles.container}>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <Pressable
        accessibilityRole="button"
        disabled={disabled || loading}
        onPress={onPress}
        style={({ pressed }) => [
          componentStyles.primaryButton,
          pressed && !disabled && !loading && componentStyles.pressed,
          (disabled || loading) && componentStyles.disabled,
        ]}
      >
        {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>{title}</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  message: {
    color: colors.dark,
    textAlign: 'center',
    ...typography.caption,
  },
  buttonText: {
    color: colors.white,
    ...typography.label,
  },
});
