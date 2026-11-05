import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getAdminUsers } from '../../repositories/adminRepository';
import { getAllClubs } from '../../repositories/clubRepository';
import { colors, componentStyles, spacing, typography } from '../../theme';

export default function ManagePresidentsScreen() {
  const [presidents, setPresidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [users, clubs] = await Promise.all([getAdminUsers(), getAllClubs()]);
      const clubNames = new Map(clubs.map((club) => [club.id, club.name]));
      setPresidents(users.filter((user) => user.role?.toLowerCase() === 'president').map((user) => ({
        ...user,
        clubName: clubNames.get(user.presidentOf) || 'Unassigned',
      })));
    } catch (error) { setMessage(error.message || 'Unable to load presidents.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  return <SafeAreaView style={styles.container}><FlatList contentContainerStyle={styles.content} data={presidents} keyExtractor={(item) => item.id || item.uid} ListHeaderComponent={<View><Text style={styles.title}>Manage Presidents</Text><Text style={styles.notice}>Assign students from Manage Clubs. When a club&apos;s president is replaced, the previous president returns to the student role.</Text>{loading ? <ActivityIndicator color={colors.primary} size="large" style={styles.loader} /> : null}<Text style={styles.error}>{message}</Text></View>} ListEmptyComponent={!loading ? <Text style={styles.empty}>No presidents found.</Text> : null} renderItem={({ item }) => <View style={styles.card}><Text style={styles.name}>{item.fullName || 'Unnamed president'}</Text><Text style={styles.meta}>{item.email || 'No email'}</Text><Text style={styles.meta}>Student ID: {item.studentId || '-'}</Text><Text style={styles.club}>Assigned club: {item.clubName}</Text></View>} /></SafeAreaView>;
}
const styles = StyleSheet.create({ container: { backgroundColor: colors.background, flex: 1 }, content: { padding: spacing.lg }, title: { color: colors.text, ...typography.screenTitle }, notice: { ...componentStyles.card, ...componentStyles.compactCard, backgroundColor: colors.chip, color: colors.text, lineHeight: 21, marginTop: spacing.md }, loader: { marginVertical: spacing.lg }, error: { color: colors.dark, marginTop: spacing.sm, textAlign: 'center' }, empty: { color: colors.secondaryText, paddingVertical: spacing.xxl, textAlign: 'center' }, card: [componentStyles.card, componentStyles.compactCard, { marginTop: spacing.sm }], name: { color: colors.text, ...typography.cardTitle }, meta: { color: colors.secondaryText, marginTop: spacing.xs, ...typography.caption }, club: { color: colors.primary, marginTop: spacing.sm, fontWeight: '600' } });
