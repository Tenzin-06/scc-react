import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '../theme';

export default function PlaceholderScreen({ route }) {
  const title = route?.params?.title || route?.name || 'Coming Soon';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>
          This screen is ready for its feature implementation in a future milestone.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  title: {
    color: colors.text,
    ...typography.screenTitle,
  },
  description: {
    color: colors.secondaryText,
    marginTop: spacing.sm,
    textAlign: 'center',
    ...typography.secondary,
  },
});
