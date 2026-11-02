import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, spacing, typography } from '../../theme';

export function AuthInput({ label, ...props }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        autoCapitalize="none"
        placeholderTextColor={colors.secondaryText}
        style={styles.input}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.text,
    marginBottom: spacing.xs,
    ...typography.caption,
  },
  input: {
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    ...typography.body,
  },
});
