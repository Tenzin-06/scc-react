import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EventCard from '../../components/EventCard';
import { getAllEvents } from '../../repositories/eventRepository';
import { getClubById } from '../../repositories/clubRepository';
import { colors, spacing, typography } from '../../theme';
import { isUpcomingEvent, sortEventsByDate } from '../../utils/eventDate';

export default function EventsScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const allEvents = await getAllEvents();
      const upcomingEvents = sortEventsByDate(allEvents.filter((event) => isUpcomingEvent(event)));
      const enrichedEvents = await Promise.all(upcomingEvents.map(async (event) => {
        if (!event.clubId) return event;
        const club = await getClubById(event.clubId).catch(() => null);
        return { ...event, clubName: club?.name || 'Club information unavailable' };
      }));
      setEvents(enrichedEvents);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load events. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  if (loading) {
    return <SafeAreaView style={styles.centered}><ActivityIndicator color={colors.primary} size="large" /></SafeAreaView>;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.title}>Unable to load events.</Text>
        <Text style={styles.message}>{error}</Text>
        <Pressable onPress={loadEvents} style={styles.button}><Text style={styles.buttonText}>Retry</Text></Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        contentContainerStyle={styles.content}
        data={events}
        keyExtractor={(event) => event.id}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No upcoming events at the moment.</Text>
            <Text style={styles.emptyMessage}>Please check back later for new events.</Text>
          </View>
        }
        ListHeaderComponent={<Text style={styles.heading}>Upcoming Events</Text>}
        renderItem={({ item }) => (
          <EventCard event={item} onPress={() => navigation.navigate('EventDetails', { eventId: item.id })} />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.lg },
  centered: { alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center', padding: spacing.xxl },
  heading: { color: colors.text, marginBottom: spacing.lg, textAlign: 'left', ...typography.sectionHeading },
  empty: { alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.xxxl },
  emptyTitle: { color: colors.text, textAlign: 'center', ...typography.sectionHeading },
  emptyMessage: { color: colors.secondaryText, marginTop: spacing.sm, textAlign: 'center', ...typography.secondary },
  title: { color: colors.text, textAlign: 'center', ...typography.sectionHeading },
  message: { color: colors.secondaryText, marginTop: spacing.sm, textAlign: 'center', ...typography.secondary },
  button: { backgroundColor: colors.primary, borderRadius: 10, marginTop: spacing.xl, paddingHorizontal: spacing.xxl, paddingVertical: spacing.md },
  buttonText: { color: colors.white, fontWeight: '600' },
});
