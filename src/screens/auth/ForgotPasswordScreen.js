import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { AuthButton } from '../../components/auth/AuthButton';
import { AuthHeader, AuthMessage, AuthTitle } from '../../components/auth/AuthHeader';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthScreen } from '../../components/auth/AuthScreen';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, typography } from '../../theme';
import { validateEmail } from './validation';

export default function ForgotPasswordScreen({ navigation }) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleResetPassword() {
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Enter your email address.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess('Password reset instructions have been sent to your email.');
    } catch (authError) {
      setError(authError.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen>
      <AuthHeader />
      <AuthTitle
        description="Enter your registered email address to receive a password reset link."
        title="Reset your password"
      />
      <AuthMessage>{error}</AuthMessage>
      <AuthMessage type="success">{success}</AuthMessage>
      <AuthInput
        autoComplete="email"
        autoCapitalize="none"
        keyboardType="email-address"
        label="Email Address"
        onChangeText={setEmail}
        placeholder="Email"
        value={email}
      />
      <AuthButton loading={loading} onPress={handleResetPassword} title="Send Reset Link" />
      <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Login')} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
        <Text style={styles.link}>Back to log in</Text>
      </Pressable>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'center',
    marginTop: spacing.xxl,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  link: {
    color: colors.primary,
    ...typography.label,
    textDecorationLine: 'underline',
  },
  pressed: { opacity: 0.65 },
});
