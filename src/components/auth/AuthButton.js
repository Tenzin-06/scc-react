import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, componentStyles, typography } from '../../theme';

export function AuthButton({ title, loading = false, ...props }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={loading || props.disabled}
      style={({ pressed }) => [
        componentStyles.primaryButton,
        pressed && !loading && !props.disabled && componentStyles.pressed,
        (loading || props.disabled) && componentStyles.disabled,
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
  text: {
    color: colors.white,
    ...typography.label,
  },
});
