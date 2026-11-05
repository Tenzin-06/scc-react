import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '../theme';

export default function ActionMenuModal({ itemName, onClose, onDelete, onEdit, visible }) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <Pressable onPress={onClose} style={styles.overlay}>
        <Pressable onPress={(event) => event.stopPropagation()} style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Manage {itemName}</Text>
          <Text style={styles.subtitle}>Choose an action for this item.</Text>
          <Pressable onPress={onEdit} style={styles.option}>
            <Text style={styles.optionText}>Edit</Text>
          </Pressable>
          <Pressable onPress={onDelete} style={[styles.option, styles.deleteOption]}>
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
          <Pressable onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: colors.border,
    borderRadius: 4,
    height: 4,
    marginBottom: spacing.lg,
    width: 42,
  },
  title: { color: colors.text, ...typography.sectionHeading },
  subtitle: { color: colors.secondaryText, marginTop: spacing.xs, ...typography.caption },
  option: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingVertical: spacing.lg,
  },
  optionText: { color: colors.text, fontWeight: '600', ...typography.body },
  deleteOption: { borderBottomWidth: 0 },
  deleteText: { color: '#B42318', fontWeight: '600', ...typography.body },
  cancel: {
    alignItems: 'center',
    backgroundColor: colors.chip,
    borderRadius: radii.md,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
  },
  cancelText: { color: colors.primary, fontWeight: '600' },
});
