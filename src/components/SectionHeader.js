import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../theme';

export default function SectionHeader({ onPress, title }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {onPress ? (
        <Pressable accessibilityRole="button" onPress={onPress}>
          <Text style={styles.action}>See All</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    ...typography.sectionHeading,
  },
  action: {
    color: colors.primary,
    ...typography.secondary,
  },
});
