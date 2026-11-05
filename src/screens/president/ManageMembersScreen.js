import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../contexts/AuthContext';
import { getClubMembers } from '../../repositories/membershipRepository';
import { colors, componentStyles, spacing, typography } from '../../theme';

export default function ManageMembersScreen() {
  const { userProfile } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadMembers = useCallback(async () => {
    if (!userProfile?.presidentOf) { setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const memberships = await getClubMembers(userProfile.presidentOf);
      setMembers(memberships);
    } catch (loadError) { setError(loadError.message || 'Unable to load members.'); }
    finally { setLoading(false); }
  }, [userProfile?.presidentOf]);
  useEffect(() => { loadMembers(); }, [loadMembers]);

  if (loading) return <SafeAreaView style={styles.centered}><ActivityIndicator color={colors.primary} size="large" /></SafeAreaView>;
  if (error) return <SafeAreaView style={styles.centered}><Text style={styles.errorTitle}>{error}</Text><Pressable accessibilityRole="button" onPress={loadMembers} style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}><Text style={styles.retry}>Retry</Text></Pressable></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        contentContainerStyle={styles.content}
        data={members}
        keyExtractor={(item) => item.userId}
        ListHeaderComponent={<Text style={styles.subtitle}>Students who have joined your assigned club.</Text>}
        ListEmptyComponent={<Text style={styles.empty}>No students have joined this club yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.displayName || 'Club member'}</Text>
            <Text style={styles.meta}>Joined {item.joinedAt?.toDate?.().toLocaleDateString?.() || 'this club'}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  centered: { alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center', padding: spacing.xxl },
  errorTitle: { color: colors.text, textAlign: 'center', ...typography.sectionHeading },
  subtitle: { color: colors.secondaryText, marginBottom: spacing.lg, ...typography.secondary },
  retryButton: { ...componentStyles.secondaryButton, marginTop: spacing.lg },
  retry: { color: colors.primary, ...typography.label },
  empty: { color: colors.secondaryText, paddingTop: spacing.xxxl, textAlign: 'center', ...typography.secondary },
  card: { ...componentStyles.card, marginBottom: spacing.sm, padding: spacing.md },
  name: { color: colors.text, ...typography.cardTitle },
  meta: { color: colors.secondaryText, marginTop: spacing.xs, ...typography.caption },
  pressed: componentStyles.pressed,
});
