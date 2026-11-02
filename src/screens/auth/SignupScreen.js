import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { AuthButton } from '../../components/auth/AuthButton';
import { AuthHeader, AuthMessage, AuthTitle } from '../../components/auth/AuthHeader';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthSelect } from '../../components/auth/AuthSelect';
import { AuthScreen } from '../../components/auth/AuthScreen';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, typography } from '../../theme';
import {
  departmentOptions,
  programmeOptions,
  semesterOptions,
} from '../../utils/profileOptions';

export default function SignupScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    studentId: '',
    email: '',
    programme: '',
    department: '',
    semester: '',
    phone: '',
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

    if ([form.fullName, form.studentId, form.email, form.password, form.confirmPassword]
      .some((value) => !value.trim())) {
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
      <AuthSelect
        label="Programme"
        onValueChange={(value) => updateField('programme', value)}
        options={programmeOptions}
        placeholder="Select programme"
        value={form.programme}
      />
      <AuthSelect
        label="Department"
        onValueChange={(value) => updateField('department', value)}
        options={departmentOptions}
        placeholder="Select department"
        value={form.department}
      />
      <AuthSelect
        label="Semester"
        onValueChange={(value) => updateField('semester', value)}
        options={semesterOptions}
        placeholder="Select semester"
        value={form.semester}
      />
      <AuthInput
        keyboardType="phone-pad"
        label="Phone"
        onChangeText={(value) => updateField('phone', value)}
        placeholder="Phone number"
        value={form.phone}
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
