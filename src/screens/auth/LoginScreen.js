import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '../../components/auth/AuthButton';
import { AuthHeader, AuthMessage, AuthTitle } from '../../components/auth/AuthHeader';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthScreen } from '../../components/auth/AuthScreen';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, typography } from '../../theme';
import { getFirebaseAuthMessage, validateEmail } from './validation';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
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
      await login(email, password);
    } catch (authError) {
      setError(authError.message || getFirebaseAuthMessage(authError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen>
      <AuthHeader />
      <AuthTitle
        description="Sign in to continue to your account."
        title="Welcome back"
      />
      <AuthMessage>{error}</AuthMessage>
      <AuthInput
        autoComplete="email"
        autoCapitalize="none"
        keyboardType="email-address"
        label="Email address"
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
        showPasswordToggle
        value={password}
      />
      <AuthButton loading={loading} onPress={handleLogin} title="Login" />
      <Pressable accessibilityRole="button" onPress={() => navigation.navigate('ForgotPassword')} style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}>
        <Text style={styles.link}>Forgot password?</Text>
      </Pressable>
      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Don&apos;t have an account?</Text>
        <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Signup')} style={({ pressed }) => [styles.createAccountButton, pressed && styles.pressed]}>
          <Text style={styles.link}>Create account</Text>
        </Pressable>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  linkButton: {
    alignSelf: 'center',
    marginTop: spacing.xxl,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  footerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
  footerText: {
    color: colors.secondaryText,
    ...typography.secondary,
  },
  createAccountButton: {
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.sm,
  },
  link: {
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  pressed: { opacity: 0.65 },
});
