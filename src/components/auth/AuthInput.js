import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, spacing, typography } from '../../theme';

export function AuthInput({ label, secureTextEntry = false, showPasswordToggle = false, ...props }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPasswordHidden = secureTextEntry && !passwordVisible;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View>
        <TextInput
          autoCapitalize="none"
          placeholderTextColor={colors.secondaryText}
          secureTextEntry={isPasswordHidden}
          style={[styles.input, showPasswordToggle && styles.inputWithToggle]}
          {...props}
        />
        {showPasswordToggle ? (
          <Pressable
            accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setPasswordVisible((visible) => !visible)}
            style={styles.toggle}
          >
            <View style={styles.eye}>
              <View style={styles.pupil} />
              {!passwordVisible ? <View style={styles.slash} /> : null}
            </View>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.text,
    marginBottom: spacing.xs,
    ...typography.caption,
  },
  input: {
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    ...typography.body,
  },
  inputWithToggle: {
    paddingRight: spacing.xxxl,
  },
  toggle: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.sm,
    top: 0,
    width: 32,
  },
  eye: {
    alignItems: 'center',
    borderColor: colors.secondaryText,
    borderRadius: 10,
    borderWidth: 1.5,
    height: 13,
    justifyContent: 'center',
    transform: [{ rotate: '0deg' }],
    width: 21,
  },
  pupil: {
    backgroundColor: colors.secondaryText,
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  slash: {
    backgroundColor: colors.secondaryText,
    height: 1.5,
    position: 'absolute',
    transform: [{ rotate: '-35deg' }],
    width: 23,
  },
});
