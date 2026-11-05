import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
        title="Create your account"
      />
      <AuthMessage>{error}</AuthMessage>
      <View style={styles.group}>
        <Text style={styles.groupTitle}>Personal details</Text>
        <AuthInput
          autoCapitalize="words"
          label="Full name"
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
          autoComplete="email"
          autoCapitalize="none"
          keyboardType="email-address"
          label="Email address"
          onChangeText={(value) => updateField('email', value)}
          placeholder="Email address"
          value={form.email}
        />
        <AuthInput
          autoComplete="tel"
          keyboardType="phone-pad"
          label="Phone"
          onChangeText={(value) => updateField('phone', value)}
          placeholder="Phone number"
          value={form.phone}
        />
      </View>
      <View style={styles.group}>
        <Text style={styles.groupTitle}>Study details</Text>
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
      </View>
      <View style={styles.group}>
        <Text style={styles.groupTitle}>Account security</Text>
        <AuthInput
          autoComplete="new-password"
          label="Password"
          onChangeText={(value) => updateField('password', value)}
          placeholder="Password"
          secureTextEntry
          showPasswordToggle
          value={form.password}
        />
        <AuthInput
          autoComplete="new-password"
          label="Confirm password"
          onChangeText={(value) => updateField('confirmPassword', value)}
          placeholder="Confirm password"
          secureTextEntry
          showPasswordToggle
          value={form.confirmPassword}
        />
      </View>
      <AuthButton loading={loading} onPress={handleSignup} title="Create account" />
      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Login')} style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}>
          <Text style={styles.link}>Log in</Text>
        </Pressable>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  group: {
    marginBottom: spacing.sm,
  },
  groupTitle: {
    color: colors.text,
    marginBottom: spacing.md,
    ...typography.cardTitle,
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
  linkButton: {
    marginLeft: spacing.xs,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  link: {
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  pressed: { opacity: 0.65 },
});
