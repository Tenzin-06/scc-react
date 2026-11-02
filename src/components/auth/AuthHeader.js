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

  return (
    <Text style={type === 'success' ? styles.successMessage : styles.errorMessage}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  logo: {
    alignItems: 'center',
    borderColor: colors.primary,
    borderRadius: radii.md,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 48,
  },
  logoText: {
    color: colors.primary,
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
    textAlign: 'center',
  },
  description: {
    color: colors.secondaryText,
    marginTop: spacing.sm,
    textAlign: 'center',
    ...typography.secondary,
  },
  errorMessage: {
    color: colors.dark,
    marginBottom: spacing.lg,
    ...typography.secondary,
  },
  successMessage: {
    color: colors.primary,
    marginBottom: spacing.lg,
    ...typography.secondary,
  },
});
