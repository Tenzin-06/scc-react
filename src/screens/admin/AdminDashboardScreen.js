import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../contexts/AuthContext';
import AppIcon from '../../components/AppIcon';
import { getAdminDashboardStats } from '../../repositories/adminRepository';
import { colors, componentStyles, spacing, typography } from '../../theme';

const statItems = [
  ['students', 'Total Students'],
  ['clubs', 'Total Clubs'],
  ['presidents', 'Total Presidents'],
  ['events', 'Total Events'],
  ['memberships', 'Total Memberships'],
  ['announcements', 'Announcements'],
];

export default function AdminDashboardScreen({ navigation }) {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setStats(await getAdminDashboardStats());
    } catch (loadError) {
      setError(loadError.message || 'Unable to load statistics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Administrator Dashboard</Text>
        <Text style={styles.welcome}>Welcome, {userProfile?.fullName || 'Administrator'}</Text>
        {loading ? <ActivityIndicator color={colors.primary} size="large" style={styles.loader} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {stats ? (
          <View style={styles.grid}>
            {statItems.map(([key, label]) => (
              <View key={key} style={styles.stat}>
                <Text style={styles.value}>{stats[key]}</Text>
                <Text style={styles.label}>{label}</Text>
              </View>
            ))}
          </View>
        ) : null}
        <Pressable onPress={loadStats} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Refresh Statistics</Text>
        </Pressable>
        <Text style={styles.section}>Management</Text>
        {[
          ['ManageUsers', 'Manage Users'],
          ['ManageClubs', 'Manage Clubs'],
          ['ManageEvents', 'Manage Events'],
          ['ManageAnnouncements', 'Manage Announcements'],
          ['ManagePresidents', 'Manage Presidents'],
        ].map(([route, label]) => (
          <Pressable key={route} onPress={() => navigation.navigate(route)} style={styles.action}>
            <View style={styles.actionIcon}>
              <AppIcon color={colors.secondaryText} name={route === 'ManageUsers' ? 'user' : route === 'ManageClubs' ? 'clubs' : route === 'ManageEvents' ? 'events' : 'settings'} />
            </View>
            <Text style={styles.actionText}>{label}</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.lg },
  title: { color: colors.text, ...typography.screenTitle },
  welcome: { color: colors.secondaryText, marginTop: spacing.sm, ...typography.secondary },
  loader: { marginVertical: spacing.xl },
  error: { color: colors.dark, marginTop: spacing.lg, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xl },
  stat: [componentStyles.card, componentStyles.compactCard, { flexGrow: 1, flexBasis: '47%' }],
  value: { color: colors.primary, ...typography.screenTitle },
  label: { color: colors.secondaryText, marginTop: spacing.xs, ...typography.caption },
  secondaryButton: { alignItems: 'center', borderColor: colors.primary, borderRadius: 10, borderWidth: 1, marginTop: spacing.lg, padding: spacing.md },
  secondaryText: { color: colors.primary, fontWeight: '600' },
  section: { color: colors.text, marginTop: spacing.xxl, ...typography.sectionHeading },
  action: [componentStyles.card, componentStyles.compactCard, { alignItems: 'center', flexDirection: 'row', marginTop: spacing.sm, minHeight: 56 }],
  actionIcon: { alignItems: 'center', width: 28 },
  actionText: { color: colors.text, flex: 1, marginLeft: spacing.sm, ...typography.secondary },
});
