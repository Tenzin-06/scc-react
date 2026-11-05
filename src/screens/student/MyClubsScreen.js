import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ClubCard from '../../components/ClubCard';
import { useAuth } from '../../contexts/AuthContext';
import { getJoinedClubs } from '../../repositories/membershipRepository';
import { colors, componentStyles, spacing, typography } from '../../theme';

export default function MyClubsScreen({ navigation }) {
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadClubs = useCallback(async () => {
    if (!user?.uid) {
      setClubs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      setClubs(await getJoinedClubs(user.uid));
    } catch (loadError) {
      setError(loadError.message || 'Unable to load your clubs.');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useFocusEffect(useCallback(() => { loadClubs(); }, [loadClubs]));

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorTitle}>Unable to load your clubs.</Text>
        <Text style={styles.message}>{error}</Text>
        <Pressable accessibilityRole="button" onPress={loadClubs} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <Text style={styles.buttonText}>Retry</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        contentContainerStyle={styles.content}
        data={clubs}
        keyExtractor={(club) => club.id}
        ListHeaderComponent={(
          <View style={styles.header}>
            <Text style={styles.subtitle}>Clubs you have joined.</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>You haven&apos;t joined any clubs yet.</Text>
            <Text style={styles.message}>Explore clubs and join one to get started.</Text>
            <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Clubs')} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
              <Text style={styles.buttonText}>Explore Clubs</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item: club }) => (
          <ClubCard
            club={club}
            onPress={() => navigation.navigate('ClubDetails', { clubId: club.id })}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  centered: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  empty: {
    alignItems: 'center',
    paddingTop: spacing.xxxl,
  },
  errorTitle: {
    color: colors.text,
    textAlign: 'center',
    ...typography.sectionHeading,
  },
  emptyTitle: {
    color: colors.text,
    textAlign: 'center',
    ...typography.sectionHeading,
  },
  subtitle: {
    color: colors.secondaryText,
    marginTop: spacing.xs,
    ...typography.secondary,
  },
  message: {
    color: colors.secondaryText,
    marginTop: spacing.sm,
    textAlign: 'center',
    ...typography.secondary,
  },
  button: {
    ...componentStyles.primaryButton,
    marginTop: spacing.xl,
  },
  buttonText: {
    color: colors.white,
    ...typography.label,
  },
  pressed: componentStyles.pressed,
});
