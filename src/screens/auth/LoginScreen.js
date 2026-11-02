import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';

import { AuthButton } from '../../components/auth/AuthButton';
import { AuthHeader, AuthMessage, AuthTitle } from '../../components/auth/AuthHeader';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthScreen } from '../../components/auth/AuthScreen';
import { auth } from '../../services/firebase';
import { colors, spacing, typography } from '../../theme';
import { getFirebaseAuthMessage, validateEmail } from './validation';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');

    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
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
        description="Sign in to continue to your account."
        title="Welcome Back"
      />
      <AuthMessage>{error}</AuthMessage>
      <AuthInput
        autoComplete="email"
        keyboardType="email-address"
        label="Email Address"
        onChangeText={setEmail}
        placeholder="Email"
        value={email}
      />
      <AuthInput
        autoComplete="password"
        label="Password"
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        value={password}
      />
      <AuthButton loading={loading} onPress={handleLogin} title="Login" />
      <Pressable onPress={() => navigation.navigate('ForgotPassword')} style={styles.linkButton}>
        <Text style={styles.link}>Forgot Password?</Text>
      </Pressable>
      <Text style={styles.footerText}>
        Don&apos;t have an account?{' '}
        <Text onPress={() => navigation.navigate('Signup')} style={styles.link}>
          Create Account
        </Text>
      </Text>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  linkButton: {
    alignSelf: 'center',
    marginTop: spacing.xxl,
  },
  footerText: {
    color: colors.secondaryText,
    marginTop: spacing.xxl,
    textAlign: 'center',
    ...typography.secondary,
  },
  link: {
    color: colors.primary,
    fontWeight: '600',
  },
});
