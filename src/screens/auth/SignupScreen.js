import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { AuthButton } from '../../components/auth/AuthButton';
import { AuthHeader, AuthMessage, AuthTitle } from '../../components/auth/AuthHeader';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthScreen } from '../../components/auth/AuthScreen';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, typography } from '../../theme';

export default function SignupScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    studentId: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function updateField(field, value) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  async function handleSignup() {
    setError('');

    if (Object.values(form).some((value) => !value.trim())) {
      setError('Complete all fields before creating your account.');
      return;
    }

    setLoading(true);
    try {
      await register(form);
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
        description="Join Student Club Connect and explore your campus clubs."
        title="Create Account"
      />
      <AuthMessage>{error}</AuthMessage>
      <AuthInput
        autoCapitalize="words"
        label="Full Name"
        onChangeText={(value) => updateField('fullName', value)}
        placeholder="Full name"
        value={form.fullName}
      />
      <AuthInput
        label="Student ID"
        onChangeText={(value) => updateField('studentId', value)}
        placeholder="Student ID"
        value={form.studentId}
      />
      <AuthInput
        keyboardType="email-address"
        label="Email Address"
        onChangeText={(value) => updateField('email', value)}
        placeholder="Email"
        value={form.email}
      />
      <AuthInput
        label="Password"
        onChangeText={(value) => updateField('password', value)}
        placeholder="Password"
        secureTextEntry
        showPasswordToggle
        value={form.password}
      />
      <AuthInput
        label="Confirm Password"
        onChangeText={(value) => updateField('confirmPassword', value)}
        placeholder="Confirm password"
        secureTextEntry
        showPasswordToggle
        value={form.confirmPassword}
      />
      <AuthButton loading={loading} onPress={handleSignup} title="Create Account" />
      <Text onPress={() => navigation.navigate('Login')} style={styles.footerText}>
        Already have an account? <Text style={styles.link}>Login</Text>
      </Text>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
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
