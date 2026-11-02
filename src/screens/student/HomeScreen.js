import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AnnouncementCard from '../../components/AnnouncementCard';
import AppIcon from '../../components/AppIcon';
import ClubCard from '../../components/ClubCard';
import EventCard from '../../components/EventCard';
import SectionHeader from '../../components/SectionHeader';
import { useAuth } from '../../contexts/AuthContext';
import { colors, radii, spacing, typography } from '../../theme';

const samplePopularClubs = [
  {
    id: 'club-1',
    name: 'Coding Club',
    category: 'Technology',
    description: 'Explore programming and software development.',
  },
  {
    id: 'club-2',
    name: 'Photography Club',
    category: 'Arts',
    description: 'Capture moments and develop photography skills.',
  },
];

const sampleUpcomingEvents = [
  {
    id: 'event-1',
    title: 'Web Development Workshop',
    date: '10 Nov 2026',
    time: '10:00 AM',
    location: 'College Auditorium',
    clubName: 'Coding Club',
  },
  {
    id: 'event-2',
    title: 'Photography Walk',
    date: '14 Nov 2026',
    time: '3:00 PM',
    location: 'Main Campus',
    clubName: 'Photography Club',
  },
];

const sampleAnnouncements = [
  {
    id: 'announcement-1',
    title: 'Club Registration Open',
    message: 'Registration for the new semester is now open.',
    date: '1 Nov 2026',
    clubName: 'Student Affairs',
  },
];

const sampleMyClubs = [samplePopularClubs[0]];

export default function HomeScreen({ navigation }) {
  const { user, userProfile } = useAuth();
  const [clubSearch, setClubSearch] = useState('');
  const displayName = userProfile?.fullName || user?.displayName || 'Student';
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);
  const filteredClubs = useMemo(() => {
    const query = clubSearch.trim().toLowerCase();
    if (!query) {
      return samplePopularClubs;
    }

    return samplePopularClubs.filter((club) =>
      `${club.name} ${club.category} ${club.description}`.toLowerCase().includes(query),
    );
  }, [clubSearch]);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Home</Text>
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filteredClubs.map((club) => (
              <ClubCard club={club} key={club.id} onPress={() => navigation.navigate('ClubDetails', { club })} />
            ))}
          </ScrollView>
          {!filteredClubs.length ? (
            <Text style={styles.emptySearch}>No clubs match your search.</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <SectionHeader onPress={() => navigation.navigate('Events')} title="Upcoming Events" />
          {sampleUpcomingEvents.map((event) => (
            <EventCard
              event={event}
              key={event.id}
              onPress={() => navigation.navigate('EventDetails', { event })}
            />
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Recent Announcements" />
          {sampleAnnouncements.map((announcement) => (
            <AnnouncementCard announcement={announcement} key={announcement.id} />
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader onPress={() => navigation.navigate('MyClubs')} title="My Clubs" />
          {sampleMyClubs.length ? sampleMyClubs.map((club) => (
            <Pressable key={club.id} onPress={() => navigation.navigate('ClubDetails', { club })} style={styles.myClub}>
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
  title: {
    color: colors.text,
    ...typography.sectionHeading,
  },
  greeting: {
    color: colors.text,
    marginTop: spacing.xxl,
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
  myClub: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
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
    ...typography.secondary,
  },
  emptySearch: {
    color: colors.secondaryText,
    marginTop: spacing.md,
    ...typography.secondary,
  },
});
