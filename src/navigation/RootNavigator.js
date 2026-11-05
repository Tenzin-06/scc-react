import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, typography } from '../theme';
import AuthNavigator from './AuthNavigator';
import StudentNavigator from './StudentNavigator';

function LoadingScreen() {
  return (
    <View style={styles.centered}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}

function MissingProfileScreen({ onLogout, onRetry }) {
  return (
    <View style={styles.centered}>
      <Text style={styles.title}>Profile unavailable</Text>
      <Text style={styles.message}>
        Your account is signed in, but a user profile could not be loaded. Please try again or
        sign out.
      </Text>
      <View style={styles.actions}>
        <Pressable onPress={onRetry} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Try again</Text>
        </Pressable>
        <Pressable onPress={onLogout} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Log out</Text>
        </Pressable>
      </View>
    </View>
  );
}

function AccessDeniedScreen({ onLogout, onRetry }) {
  return (
    <View style={styles.centered}>
      <Text style={styles.title}>Access unavailable</Text>
      <Text style={styles.message}>
        Your account does not have a valid application role. Please contact an administrator or
        try loading your profile again.
      </Text>
      <View style={styles.actions}>
        <Pressable onPress={onRetry} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Try again</Text>
        </Pressable>
        <Pressable onPress={onLogout} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Log out</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function RootNavigator() {
  const {
    isAuthenticated,
    loading,
    logout,
    profileError,
    profileLoading,
    refreshUserProfile,
    role,
    userProfile,
  } = useAuth();

  if (loading || (isAuthenticated && profileLoading)) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  if (!userProfile || profileError) {
    return <MissingProfileScreen onLogout={logout} onRetry={refreshUserProfile} />;
  }

  switch (role) {
    case 'president':
    case 'student':
    case 'admin':
      return <StudentNavigator />;
    default:
      return <AccessDeniedScreen onLogout={logout} onRetry={refreshUserProfile} />;
  }
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  title: {
    color: colors.text,
    textAlign: 'center',
    ...typography.sectionHeading,
  },
  message: {
    color: colors.secondaryText,
    marginTop: spacing.sm,
    maxWidth: 360,
    textAlign: 'center',
    ...typography.secondary,
  },
  actions: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    width: '100%',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    maxWidth: 360,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    width: '100%',
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
