import { StyleSheet } from 'react-native';

import { colors } from './colors';
import { radii } from './radii';
import { spacing } from './spacing';
import { typography } from './typography';

export const componentStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.card,
    borderWidth: 1,
    padding: spacing.lg,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  primaryButtonText: {
    color: colors.white,
    ...typography.label,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  secondaryButtonText: {
    color: colors.primary,
    ...typography.label,
  },
  input: {
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    ...typography.body,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: colors.chip,
    borderRadius: radii.pill,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  chipText: {
    color: colors.text,
    ...typography.secondary,
  },
  selectedChip: {
    backgroundColor: colors.primary,
  },
  selectedChipText: {
    color: colors.white,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
    width: '100%',
  },
});
