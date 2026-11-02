import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../contexts/AuthContext';
import { getClubMembers } from '../../repositories/membershipRepository';
import { getUserProfile } from '../../repositories/userRepository';
import { colors, spacing, typography } from '../../theme';

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
      const profiles = await Promise.all(memberships.map(async (member) => ({ ...member, profile: await getUserProfile(member.userId) })));
      setMembers(profiles);
    } catch (loadError) { setError(loadError.message || 'Unable to load members.'); }
    finally { setLoading(false); }
  }, [userProfile?.presidentOf]);
  useEffect(() => { loadMembers(); }, [loadMembers]);
  if (loading) return <SafeAreaView style={styles.centered}><ActivityIndicator color={colors.primary} size="large" /></SafeAreaView>;
  if (error) return <SafeAreaView style={styles.centered}><Text style={styles.title}>{error}</Text><Text onPress={loadMembers} style={styles.retry}>Retry</Text></SafeAreaView>;
  return <SafeAreaView style={styles.container}><FlatList contentContainerStyle={styles.content} data={members} keyExtractor={(item) => item.userId} ListEmptyComponent={<Text style={styles.empty}>No students have joined this club yet.</Text>} renderItem={({ item }) => <View style={styles.card}><Text style={styles.name}>{item.profile?.fullName || 'Student profile unavailable'}</Text><Text style={styles.meta}>{item.profile?.studentId || 'Student ID unavailable'}</Text><Text style={styles.meta}>{item.profile?.programme || 'Programme unavailable'}{item.profile?.department ? ` • ${item.profile.department}` : ''}</Text></View>} /></SafeAreaView>;
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.lg },
  centered: { alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center', padding: spacing.xxl },
  title: { color: colors.text, textAlign: 'center', ...typography.sectionHeading },
  retry: { color: colors.primary, fontWeight: '600', marginTop: spacing.lg },
  empty: { color: colors.secondaryText, paddingTop: spacing.xxxl, textAlign: 'center', ...typography.secondary },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 10, borderWidth: 1, marginBottom: spacing.sm, padding: spacing.md },
  name: { color: colors.text, ...typography.cardTitle },
  meta: { color: colors.secondaryText, marginTop: spacing.xs, ...typography.caption },
});
