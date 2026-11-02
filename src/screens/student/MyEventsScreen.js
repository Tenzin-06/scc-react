import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EventCard from '../../components/EventCard';
import { useAuth } from '../../contexts/AuthContext';
import { getClubById } from '../../repositories/clubRepository';
import { getRegisteredEvents } from '../../repositories/eventRegistrationRepository';
import { colors, spacing, typography } from '../../theme';

export default function MyEventsScreen({ navigation }) {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadEvents = useCallback(async () => {
    if (!user?.uid) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const registeredEvents = await getRegisteredEvents(user.uid);
      const enrichedEvents = await Promise.all(registeredEvents.map(async (event) => {
        const club = event.clubId ? await getClubById(event.clubId).catch(() => null) : null;
        return { ...event, clubName: club?.name || 'Club information unavailable' };
      }));
      setEvents(enrichedEvents);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load your registered events. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  if (loading) {
    return <SafeAreaView style={styles.centered}><ActivityIndicator color={colors.primary} size="large" /></SafeAreaView>;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.title}>Unable to load your registered events.</Text>
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
            <Text style={styles.title}>You haven&apos;t registered for any events yet.</Text>
            <Pressable onPress={() => navigation.navigate('StudentTabs', { screen: 'Events' })} style={styles.button}>
              <Text style={styles.buttonText}>Browse Events</Text>
            </Pressable>
          </View>
        }
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
  empty: { alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.xxxl },
  title: { color: colors.text, textAlign: 'center', ...typography.sectionHeading },
  message: { color: colors.secondaryText, marginTop: spacing.sm, textAlign: 'center', ...typography.secondary },
  button: { backgroundColor: colors.primary, borderRadius: 10, marginTop: spacing.xl, paddingHorizontal: spacing.xxl, paddingVertical: spacing.md },
  buttonText: { color: colors.white, fontWeight: '600' },
});
