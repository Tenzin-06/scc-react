import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '../../theme';

export function AuthSelect({ label, options, onValueChange, placeholder, value }) {
  const [visible, setVisible] = useState(false);

  function selectOption(option) {
    onValueChange(option);
    setVisible(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityLabel={`${label}: ${value || placeholder}`}
        accessibilityRole="button"
        onPress={() => setVisible(true)}
        style={styles.field}
      >
        <Text style={value ? styles.value : styles.placeholder}>
          {value || placeholder}
        </Text>
        <Text style={styles.chevron}>▼</Text>
      </Pressable>

      <Modal
        animationType="fade"
        onRequestClose={() => setVisible(false)}
        transparent
        visible={visible}
      >
        <Pressable onPress={() => setVisible(false)} style={styles.overlay}>
          <Pressable onPress={(event) => event.stopPropagation()} style={styles.menu}>
            <Text style={styles.menuTitle}>Select {label}</Text>
            {options.map((option) => (
              <Pressable
                accessibilityRole="button"
                key={option}
                onPress={() => selectOption(option)}
                style={[styles.option, option === value && styles.selectedOption]}
              >
                <Text style={[styles.optionText, option === value && styles.selectedOptionText]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
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
  field: {
    alignItems: 'center',
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  value: {
    color: colors.text,
    ...typography.body,
  },
  placeholder: {
    color: colors.secondaryText,
    ...typography.body,
  },
  chevron: {
    color: colors.secondaryText,
    fontSize: 12,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  menu: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    maxWidth: 440,
    padding: spacing.sm,
    width: '100%',
  },
  menuTitle: {
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.cardTitle,
  },
  option: {
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  selectedOption: {
    backgroundColor: colors.chip,
  },
  optionText: {
    color: colors.text,
    ...typography.body,
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
