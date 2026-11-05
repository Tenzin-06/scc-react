import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EventCard from '../../components/EventCard';
import { useAuth } from '../../contexts/AuthContext';
import { addBookmark, getUserBookmarks, removeBookmark } from '../../repositories/bookmarkRepository';
import { getAllEvents, subscribeToAllEvents } from '../../repositories/eventRepository';
import { getClubById } from '../../repositories/clubRepository';
import { cancelEventRegistration, getRegisteredEvents, registerForEvent } from '../../repositories/eventRegistrationRepository';
import { colors, componentStyles, spacing, typography } from '../../theme';
import { sortEventsByDate } from '../../utils/eventDate';

export default function EventsScreen({ navigation }) {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [bookmarkLoadingId, setBookmarkLoadingId] = useState(null);
  const [registeredIds, setRegisteredIds] = useState(new Set());
  const [registrationLoadingId, setRegistrationLoadingId] = useState(null);

  const loadEvents = useCallback(async (latestEvents) => {
    setError('');
    try {
      const allEvents = latestEvents || await getAllEvents();
      const sortedEvents = sortEventsByDate(allEvents);
      const enrichedEvents = await Promise.all(sortedEvents.map(async (event) => {
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

    try {
      const bookmarks = await getUserBookmarks(user.uid);
      setBookmarkedIds(new Set(bookmarks.filter((bookmark) => bookmark.itemType === 'event').map((bookmark) => bookmark.itemId)));
    } catch (bookmarkError) {
      Alert.alert('Bookmark status unavailable', bookmarkError.message || 'Please try again.');
    }
  }, [user?.uid]);

  const loadRegistrations = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const registrations = await getRegisteredEvents(user.uid);
      setRegisteredIds(new Set(registrations.map((event) => event.id)));
    } catch {
      setRegisteredIds(new Set());
    }
  }, [user?.uid]);

  async function toggleRegistration(eventId) {
    if (registrationLoadingId) return;
    setRegistrationLoadingId(eventId);
    try {
      if (registeredIds.has(eventId)) {
        await cancelEventRegistration(user.uid, eventId);
        setRegisteredIds((current) => { const next = new Set(current); next.delete(eventId); return next; });
      } else {
        await registerForEvent(user.uid, eventId);
        setRegisteredIds((current) => new Set(current).add(eventId));
      }
    } catch (registrationError) {
      Alert.alert('Registration could not be updated', registrationError.message || 'Please try again.');
    } finally {
      setRegistrationLoadingId(null);
    }
  }

  async function toggleBookmark(eventId) {
    if (bookmarkLoadingId) return;
    setBookmarkLoadingId(eventId);
    try {
      if (bookmarkedIds.has(eventId)) {
        await removeBookmark(user.uid, eventId, 'event');
        setBookmarkedIds((current) => { const next = new Set(current); next.delete(eventId); return next; });
      } else {
        await addBookmark(user.uid, eventId, 'event');
        setBookmarkedIds((current) => new Set(current).add(eventId));
      }
    } catch (bookmarkError) {
      Alert.alert('Bookmark could not be updated', bookmarkError.message || 'Please try again.');
    } finally {
      setBookmarkLoadingId(null);
    }
  }

  useEffect(() => subscribeToAllEvents(
    loadEvents,
    (loadError) => {
      setError(loadError.message || 'Unable to load events. Please check your connection and try again.');
      setLoading(false);
    },
  ), [loadEvents]);

  useFocusEffect(useCallback(() => {
    loadEvents();
    loadRegistrations();
  }, [loadEvents, loadRegistrations]));

  if (loading) {
    return <SafeAreaView style={styles.centered}><ActivityIndicator color={colors.primary} size="large" /></SafeAreaView>;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.title}>Unable to load events.</Text>
        <Text style={styles.message}>{error}</Text>
        <Pressable accessibilityRole="button" onPress={loadEvents} style={({ pressed }) => [styles.button, pressed && styles.pressed]}><Text style={styles.buttonText}>Retry</Text></Pressable>
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
            <Text style={styles.emptyTitle}>No events available at the moment.</Text>
            <Text style={styles.emptyMessage}>Events will appear here once they are created.</Text>
          </View>
        }
        ListHeaderComponent={(
          <View style={styles.header}>
            <Text style={styles.heading}>Events</Text>
            <Text style={styles.description}>Find events hosted by clubs across campus.</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <EventCard event={item} bookmarked={bookmarkedIds.has(item.id)} bookmarkLoading={bookmarkLoadingId === item.id} onBookmark={() => toggleBookmark(item.id)} onRegister={() => toggleRegistration(item.id)} registered={registeredIds.has(item.id)} registering={registrationLoadingId === item.id} onPress={() => navigation.navigate('EventDetails', { eventId: item.id })} />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  header: { marginBottom: spacing.lg },
  centered: { alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center', padding: spacing.xxl },
  heading: { color: colors.text, textAlign: 'left', ...typography.screenTitle },
  description: { color: colors.secondaryText, marginTop: spacing.xs, ...typography.secondary },
  empty: { alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.xxxl },
  emptyTitle: { color: colors.text, textAlign: 'center', ...typography.sectionHeading },
  emptyMessage: { color: colors.secondaryText, marginTop: spacing.sm, textAlign: 'center', ...typography.secondary },
  title: { color: colors.text, textAlign: 'center', ...typography.sectionHeading },
  message: { color: colors.secondaryText, marginTop: spacing.sm, textAlign: 'center', ...typography.secondary },
  button: { ...componentStyles.primaryButton, marginTop: spacing.xl },
  buttonText: { color: colors.white, ...typography.label },
  pressed: componentStyles.pressed,
});
