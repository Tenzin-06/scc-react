import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../contexts/AuthContext';
import { getClubById } from '../../repositories/clubRepository';
import { getClubMemberCount } from '../../repositories/membershipRepository';
import { getAllEvents } from '../../repositories/eventRepository';
import { getAnnouncementsByClub } from '../../repositories/announcementRepository';
import { colors, spacing, typography } from '../../theme';

export default function PresidentDashboardScreen({ navigation }) {
  const { user, userProfile } = useAuth();
  const clubId = userProfile?.presidentOf;
  const [club, setClub] = useState(null);
  const [stats, setStats] = useState({ members: 0, events: 0, announcements: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    if (!user?.uid || !clubId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [nextClub, members, events, announcements] = await Promise.all([
        getClubById(clubId),
        getClubMemberCount(clubId),
        getAllEvents(),
        getAnnouncementsByClub(clubId),
      ]);
      setClub(nextClub);
      setStats({
        members,
        events: events.filter((event) => event.clubId === clubId).length,
        announcements: announcements.length,
      });
    } catch (loadError) {
      setError(loadError.message || 'Unable to load your club dashboard.');
    } finally {
      setLoading(false);
    }
  }, [clubId, user?.uid]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) return <SafeAreaView style={styles.centered}><ActivityIndicator color={colors.primary} size="large" /></SafeAreaView>;
  if (!clubId) return <SafeAreaView style={styles.centered}><Text style={styles.title}>No club assigned</Text><Text style={styles.message}>An administrator must assign a club before management access is available.</Text></SafeAreaView>;
  if (error || !club) return <SafeAreaView style={styles.centered}><Text style={styles.title}>Unable to load dashboard</Text><Text style={styles.message}>{error || 'Club not found.'}</Text><Pressable onPress={loadDashboard} style={styles.button}><Text style={styles.buttonText}>Retry</Text></Pressable></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Welcome, {userProfile?.fullName || 'President'}</Text>
        <Text style={styles.clubName}>{club.name}</Text>
        <Text style={styles.message}>{club.category || 'Club'}{club.description ? ` • ${club.description}` : ''}</Text>
        <View style={styles.stats}>
          <Stat label="Members" value={stats.members} />
          <Stat label="Events" value={stats.events} />
          <Stat label="Announcements" value={stats.announcements} />
        </View>
        {[
          ['ManageClub', 'Manage Club'],
          ['ManageMembers', 'Manage Members'],
          ['ManageEvents', 'Manage Events'],
          ['ManageAnnouncements', 'Manage Announcements'],
        ].map(([route, label]) => (
          <Pressable key={route} onPress={() => navigation.navigate(route)} style={styles.action}>
            <Text style={styles.actionText}>{label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }) {
  return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.lg },
  centered: { alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center', padding: spacing.xxl },
  title: { color: colors.text, textAlign: 'center', ...typography.screenTitle },
  clubName: { color: colors.primary, marginTop: spacing.xl, textAlign: 'center', ...typography.sectionHeading },
  message: { color: colors.secondaryText, marginTop: spacing.sm, textAlign: 'center', ...typography.secondary },
  stats: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 12, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-around', marginVertical: spacing.xl, padding: spacing.md },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { color: colors.primary, ...typography.screenTitle },
  statLabel: { color: colors.secondaryText, marginTop: spacing.xs, textAlign: 'center', ...typography.caption },
  action: { backgroundColor: colors.primary, borderRadius: 10, marginTop: spacing.md, padding: spacing.lg },
  actionText: { color: colors.white, fontWeight: '600', textAlign: 'center' },
  button: { backgroundColor: colors.primary, borderRadius: 10, marginTop: spacing.xl, padding: spacing.md },
  buttonText: { color: colors.white, fontWeight: '600' },
});
