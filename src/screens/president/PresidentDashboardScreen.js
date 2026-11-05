import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AnnouncementCard from '../../components/AnnouncementCard';
import AppIcon from '../../components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import { getClubById } from '../../repositories/clubRepository';
import { getClubMemberCount } from '../../repositories/membershipRepository';
import { getAllEvents } from '../../repositories/eventRepository';
import { getAnnouncementsByClub } from '../../repositories/announcementRepository';
import { getAnnouncementDate } from '../../utils/announcementDate';
import { isUpcomingEvent, sortEventsByDate } from '../../utils/eventDate';
import { colors, componentStyles, spacing, typography } from '../../theme';

export default function PresidentDashboardScreen({ navigation }) {
  const { user, userProfile } = useAuth();
  const clubId = userProfile?.presidentOf;
  const [club, setClub] = useState(null);
  const [stats, setStats] = useState({ members: 0, events: 0, announcements: 0 });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
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
      const clubEvents = events.filter((event) => event.clubId === clubId);
      setStats({
        members,
        events: clubEvents.length,
        announcements: announcements.length,
      });
      setUpcomingEvents(sortEventsByDate(clubEvents.filter((event) => isUpcomingEvent(event)))
        .slice(0, 3)
        .map((event) => ({ ...event, clubName: nextClub?.name || 'Your club' })));
      setRecentAnnouncements(announcements.slice(0, 3).map((announcement) => ({
        ...announcement,
        clubName: nextClub?.name || 'Your club',
        date: getAnnouncementDate(announcement.createdAt),
      })));
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
  if (error || !club) return <SafeAreaView style={styles.centered}><Text style={styles.title}>Unable to load dashboard</Text><Text style={styles.message}>{error || 'Club not found.'}</Text><Pressable accessibilityRole="button" onPress={loadDashboard} style={({ pressed }) => [styles.button, pressed && styles.pressed]}><Text style={styles.buttonText}>Retry</Text></Pressable></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Welcome, {userProfile?.fullName || 'President'}</Text>
        <View style={styles.clubCard}>
          <Text style={styles.clubName}>{club.name}</Text>
          <Text style={styles.category}>{club.category || 'Club'}</Text>
          {club.description ? <Text style={styles.clubDescription}>{club.description}</Text> : null}
        </View>
        <View style={styles.stats}>
          <Stat label="Members" value={stats.members} />
          <Stat label="Events" value={stats.events} />
          <Stat label="Announcements" value={stats.announcements} />
        </View>
        <Text style={styles.sectionTitle}>Upcoming events</Text>
        {upcomingEvents.length ? upcomingEvents.map((event) => (
          <View key={event.id} style={styles.eventRow}>
            <View style={styles.eventDate}><Text style={styles.eventDateText}>{event.date}</Text></View>
            <View style={styles.eventDetails}>
              <Text numberOfLines={1} style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventMeta}>{event.time}</Text>
              <Text numberOfLines={1} style={styles.eventMeta}>{event.location}</Text>
            </View>
          </View>
        )) : <Text style={styles.empty}>No upcoming events for your club.</Text>}
        <Text style={styles.sectionTitle}>Recent announcements</Text>
        {recentAnnouncements.length ? recentAnnouncements.map((announcement) => (
          <AnnouncementCard announcement={announcement} key={announcement.id} />
        )) : <Text style={styles.empty}>No announcements for your club yet.</Text>}
        <Text style={styles.sectionTitle}>Management</Text>
        {[
          ['ManageClub', 'Manage club'],
          ['ManageMembers', 'Manage members'],
          ['PresidentEvents', 'Manage events'],
          ['PresidentAnnouncements', 'Manage announcements'],
        ].map(([route, label]) => (
          <Pressable key={route} accessibilityRole="button" onPress={() => navigation.navigate(route)} style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
            <View style={styles.actionIcon}>
              <AppIcon color={colors.secondaryText} name={route === 'ManageMembers' ? 'user' : route === 'PresidentEvents' ? 'events' : route === 'PresidentAnnouncements' ? 'bell' : 'clubs'} />
            </View>
            <Text style={styles.actionText}>{label}</Text>
            <Text style={styles.chevron}>›</Text>
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
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  centered: { alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center', padding: spacing.xxl },
  title: { color: colors.text, ...typography.screenTitle },
  clubCard: { ...componentStyles.card, marginTop: spacing.xl },
  clubName: { color: colors.text, ...typography.sectionHeading },
  category: { color: colors.primary, marginTop: spacing.xs, ...typography.label },
  clubDescription: { color: colors.secondaryText, marginTop: spacing.sm, ...typography.secondary },
  message: { color: colors.secondaryText, marginTop: spacing.sm, textAlign: 'center', ...typography.secondary },
  stats: { ...componentStyles.card, flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.lg, paddingVertical: spacing.md },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { color: colors.primary, ...typography.sectionHeading },
  statLabel: { color: colors.secondaryText, marginTop: spacing.xs, textAlign: 'center', ...typography.caption },
  sectionTitle: { color: colors.text, marginBottom: spacing.sm, marginTop: spacing.xxl, ...typography.cardTitle },
  eventRow: { ...componentStyles.card, alignItems: 'center', flexDirection: 'row', marginBottom: spacing.sm, padding: spacing.md },
  eventDate: { alignItems: 'center', backgroundColor: colors.background, borderRadius: 6, justifyContent: 'center', minHeight: 52, padding: spacing.xs, width: 64 },
  eventDateText: { color: colors.primary, textAlign: 'center', ...typography.caption },
  eventDetails: { flex: 1, marginLeft: spacing.md, minWidth: 0 },
  eventTitle: { color: colors.text, ...typography.label },
  eventMeta: { color: colors.secondaryText, marginTop: spacing.xs, ...typography.caption },
  empty: { color: colors.secondaryText, ...typography.secondary },
  action: [componentStyles.card, componentStyles.compactCard, { alignItems: 'center', flexDirection: 'row', marginTop: spacing.sm, minHeight: 56 }],
  actionIcon: { alignItems: 'center', width: 28 },
  actionText: { color: colors.text, flex: 1, marginLeft: spacing.sm, ...typography.secondary },
  chevron: { color: colors.secondaryText, fontSize: 25, fontWeight: '300' },
  button: { ...componentStyles.primaryButton, marginTop: spacing.xl },
  buttonText: { color: colors.white, ...typography.label },
  pressed: componentStyles.pressed,
});
