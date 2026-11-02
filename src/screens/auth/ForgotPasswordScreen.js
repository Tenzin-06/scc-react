import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';

import { AuthButton } from '../../components/auth/AuthButton';
import { AuthHeader, AuthMessage, AuthTitle } from '../../components/auth/AuthHeader';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthScreen } from '../../components/auth/AuthScreen';
import { auth } from '../../services/firebase';
import { colors, spacing, typography } from '../../theme';
import { getFirebaseAuthMessage, validateEmail } from './validation';

export default function ForgotPasswordScreen({ navigation }) {
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
      await sendPasswordResetEmail(auth, email.trim());
      setSuccess('Password reset instructions have been sent to your email.');
    } catch (authError) {
      setError(getFirebaseAuthMessage(authError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen>
      <AuthHeader />
      <AuthTitle
        description="Enter your registered email address and we will send you a password reset link."
        title="Forgot Password?"
      />
      <AuthMessage>{error}</AuthMessage>
      <AuthMessage type="success">{success}</AuthMessage>
      <AuthInput
        keyboardType="email-address"
        label="Email Address"
        onChangeText={setEmail}
        placeholder="Email"
        value={email}
      />
      <AuthButton loading={loading} onPress={handleResetPassword} title="Send Reset Link" />
      <Pressable onPress={() => navigation.navigate('Login')} style={styles.backButton}>
        <Text style={styles.link}>Back to Login</Text>
      </Pressable>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'center',
    marginTop: spacing.xxl,
  },
  link: {
    color: colors.primary,
    ...typography.label,
  },
});
