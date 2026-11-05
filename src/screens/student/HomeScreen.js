import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AnnouncementCard from '../../components/AnnouncementCard';
import AppIcon from '../../components/AppIcon';
import ClubCard from '../../components/ClubCard';
import EventCard from '../../components/EventCard';
import SectionHeader from '../../components/SectionHeader';
import { useAuth } from '../../contexts/AuthContext';
import { getAllClubs, getClubById } from '../../repositories/clubRepository';
import { getRecentAnnouncements } from '../../repositories/announcementRepository';
import { getAllEvents, subscribeToAllEvents } from '../../repositories/eventRepository';
import { getJoinedClubs } from '../../repositories/membershipRepository';
import { getAnnouncementDate } from '../../utils/announcementDate';
import { isUpcomingEvent, sortEventsByDate } from '../../utils/eventDate';
import { colors, componentStyles, radii, spacing, typography } from '../../theme';

export default function HomeScreen({ navigation }) {
  const { user, userProfile } = useAuth();
  const [clubSearch, setClubSearch] = useState('');
  const [popularClubs, setPopularClubs] = useState([]);
  const [clubsError, setClubsError] = useState('');
  const [myClubs, setMyClubs] = useState([]);
  const [myClubsError, setMyClubsError] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsError, setAnnouncementsError] = useState('');
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [eventsError, setEventsError] = useState('');
  const displayName = userProfile?.fullName || user?.displayName || 'Student';
  const loadMyClubs = useCallback(async () => {
    if (!user?.uid) {
      setMyClubs([]);
      setMyClubsError('');
      return;
    }

    try {
      setMyClubsError('');
      setMyClubs(await getJoinedClubs(user.uid));
    } catch (error) {
      setMyClubs([]);
      setMyClubsError(error.message || 'Unable to load your clubs.');
    }
  }, [user?.uid]);

  const loadPopularClubs = useCallback(async () => {
    try {
      setClubsError('');
      const clubs = await getAllClubs();
      const rankedClubs = [...clubs]
        .sort((first, second) => {
          const memberDifference = (Number(second.memberCount) || 0) - (Number(first.memberCount) || 0);
          return memberDifference || (first.name || '').localeCompare(second.name || '');
        })
        .slice(0, 5);
      setPopularClubs(rankedClubs);
    } catch (error) {
      setPopularClubs([]);
      setClubsError(error.message || 'Unable to load popular clubs.');
    }
  }, []);

  const loadAnnouncements = useCallback(async () => {
    try {
      setAnnouncementsError('');
      const recent = await getRecentAnnouncements(3);
      const enriched = await Promise.all(recent.map(async (announcement) => {
        const club = announcement.clubId ? await getClubById(announcement.clubId).catch(() => null) : null;
        return {
          ...announcement,
          clubName: club?.name || 'General announcement',
          date: getAnnouncementDate(announcement.createdAt),
        };
      }));
      setAnnouncements(enriched);
    } catch (error) {
      setAnnouncements([]);
      setAnnouncementsError(error.message || 'Unable to load announcements.');
    }
  }, []);

  const loadUpcomingEvents = useCallback(async (latestEvents) => {
    try {
      setEventsError('');
      const allEvents = latestEvents || await getAllEvents();
      const upcoming = sortEventsByDate(allEvents.filter((event) => isUpcomingEvent(event)));
      const enriched = await Promise.all(upcoming.slice(0, 3).map(async (event) => {
        const club = event.clubId ? await getClubById(event.clubId).catch(() => null) : null;
        return {
          ...event,
          clubName: club?.name || 'Student Club',
        };
      }));
      setUpcomingEvents(enriched);
    } catch (error) {
      setUpcomingEvents([]);
      setEventsError(error.message || 'Unable to load upcoming events.');
    }
  }, []);

  useFocusEffect(useCallback(() => {
    loadMyClubs();
    loadPopularClubs();
    loadAnnouncements();
    loadUpcomingEvents();
  }, [loadMyClubs, loadPopularClubs, loadAnnouncements, loadUpcomingEvents]));

  useEffect(() => subscribeToAllEvents(
    loadUpcomingEvents,
    (error) => setEventsError(error.message || 'Unable to load upcoming events.'),
  ), [loadUpcomingEvents]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);
  const filteredClubs = useMemo(() => {
    const query = clubSearch.trim().toLowerCase();
    if (!query) {
      return popularClubs;
    }

    return popularClubs.filter((club) =>
      `${club.name} ${club.category} ${club.description}`.toLowerCase().includes(query),
    );
  }, [clubSearch, popularClubs]);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>{greeting}, {displayName}!</Text>
        <Text style={styles.subtitle}>Welcome back to Student Club Connect.</Text>

        <View style={styles.section}>
          <View style={styles.searchContainer}>
            <AppIcon color={colors.secondaryText} name="search" size={19} />
            <TextInput
              accessibilityLabel="Search popular clubs"
              onChangeText={setClubSearch}
              placeholder="Search clubs"
              placeholderTextColor={colors.secondaryText}
              style={styles.searchInput}
              value={clubSearch}
            />
          </View>
          <SectionHeader onPress={() => navigation.navigate('Clubs')} title="Popular Clubs" />
          <ScrollView contentContainerStyle={styles.clubRail} horizontal showsHorizontalScrollIndicator={false}>
            {filteredClubs.map((club) => (
              <ClubCard club={club} key={club.id} onPress={() => navigation.navigate('ClubDetails', { clubId: club.id })} />
            ))}
          </ScrollView>
          {clubsError ? <Text style={styles.empty}>{clubsError}</Text> : !filteredClubs.length ? (
            <Text style={styles.emptySearch}>{clubSearch.trim() ? 'No clubs match your search.' : 'No clubs available at the moment.'}</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <SectionHeader onPress={() => navigation.navigate('Events')} title="Upcoming Events" />
          {eventsError ? <Text style={styles.empty}>{eventsError}</Text> : upcomingEvents.length ? upcomingEvents.map((event) => (
            <EventCard
              event={event}
              key={event.id}
              onPress={() => navigation.navigate('EventDetails', { eventId: event.id })}
            />
          )) : <Text style={styles.empty}>No upcoming events available at the moment.</Text>}
        </View>

        <View style={styles.section}>
          <SectionHeader onPress={() => navigation.navigate('Announcements')} title="Recent Announcements" />
          {announcementsError ? <Text style={styles.empty}>{announcementsError}</Text> : announcements.length ? announcements.map((announcement) => (
            <AnnouncementCard
              announcement={announcement}
              key={announcement.id}
              onPress={() => navigation.navigate('AnnouncementDetails', { announcementId: announcement.id })}
            />
          )) : <Text style={styles.empty}>No announcements available at the moment.</Text>}
        </View>

        <View style={styles.section}>
          <SectionHeader onPress={() => navigation.navigate('MyClubs')} title="My Clubs" />
          {myClubsError ? <Text style={styles.empty}>{myClubsError}</Text> : myClubs.length ? myClubs.map((club) => (
            <Pressable key={club.id} onPress={() => navigation.navigate('ClubDetails', { clubId: club.id })} style={({ pressed }) => [styles.myClub, pressed && styles.pressed]}>
              <Text style={styles.myClubName}>{club.name}</Text>
              <Text style={styles.myClubCategory}>{club.category}</Text>
            </Pressable>
          )) : <Text style={styles.empty}>You have not joined any clubs yet.</Text>}
        </View>
      </ScrollView>
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
  greeting: {
    color: colors.text,
    marginTop: spacing.xs,
    ...typography.screenTitle,
  },
  subtitle: {
    color: colors.secondaryText,
    marginTop: spacing.xs,
    ...typography.secondary,
  },
  searchContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: spacing.lg,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    marginLeft: spacing.sm,
    paddingVertical: spacing.sm,
    ...typography.body,
  },
  section: {
    marginTop: spacing.xxl,
  },
  clubRail: {
    paddingBottom: spacing.xs,
  },
  myClub: {
    ...componentStyles.card,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  myClubName: {
    color: colors.text,
    ...typography.cardTitle,
  },
  myClubCategory: {
    color: colors.secondaryText,
    marginTop: spacing.xs,
    ...typography.caption,
  },
  empty: {
    color: colors.secondaryText,
    marginTop: spacing.sm,
    ...typography.secondary,
  },
  emptySearch: {
    color: colors.secondaryText,
    marginTop: spacing.md,
    ...typography.secondary,
  },
  pressed: componentStyles.pressed,
});
