import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '../../theme';

export function AuthSelect({ disabled = false, emptyMessage = 'No options available.', label, options = [], onValueChange, placeholder, value }) {
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
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => setVisible(true)}
        style={[styles.field, disabled && styles.disabledField]}
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
            {options.length ? (
              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator style={styles.optionsList}>
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
              </ScrollView>
            ) : <Text style={styles.emptyMessage}>{emptyMessage}</Text>}
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
    ...typography.label,
  },
  field: {
    alignItems: 'center',
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  disabledField: {
    opacity: 0.65,
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
  optionsList: {
    maxHeight: 360,
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
  emptyMessage: {
    color: colors.secondaryText,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.secondary,
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
