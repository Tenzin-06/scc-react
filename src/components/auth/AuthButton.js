import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, radii, spacing, typography } from '../../theme';

export function AuthButton({ title, loading = false, ...props }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={loading || props.disabled}
      style={({ pressed }) => [
        styles.button,
        pressed && !loading && styles.pressed,
        (loading || props.disabled) && styles.disabled,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.xl,
  },
  pressed: {
    backgroundColor: colors.dark,
  },
  disabled: {
    opacity: 0.65,
  },
  text: {
    color: colors.white,
    ...typography.label,
  },
});
