import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '../../theme';

export function AuthHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Text style={styles.logoText}>SCC</Text>
      </View>
      <Text style={styles.appName}>Student Club Connect</Text>
    </View>
  );
}

export function AuthTitle({ title, description }) {
  return (
    <View style={styles.titleContainer}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

export function AuthMessage({ children, type = 'error' }) {
  if (!children) {
    return null;
  }

  const success = type === 'success';

  return (
    <View style={[styles.message, success ? styles.successMessage : styles.errorMessage]}>
      <Text style={success ? styles.successText : styles.errorText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  logo: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderRadius: radii.md,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 48,
  },
  logoText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  appName: {
    color: colors.text,
    ...typography.label,
  },
  titleContainer: {
    marginBottom: spacing.xxl,
  },
  title: {
    color: colors.text,
    ...typography.screenTitle,
    textAlign: 'left',
  },
  description: {
    color: colors.secondaryText,
    marginTop: spacing.sm,
    textAlign: 'left',
    ...typography.secondary,
  },
  message: {
    borderLeftWidth: 3,
    borderRadius: radii.sm,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  errorMessage: {
    backgroundColor: colors.chip,
    borderLeftColor: colors.dark,
  },
  errorText: {
    color: colors.dark,
    ...typography.secondary,
  },
  successMessage: {
    backgroundColor: colors.background,
    borderLeftColor: colors.primary,
  },
  successText: {
    color: colors.primary,
    ...typography.secondary,
  },
});
