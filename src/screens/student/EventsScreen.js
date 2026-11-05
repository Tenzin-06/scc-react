import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EventCard from '../../components/EventCard';
import { useAuth } from '../../contexts/AuthContext';
import { addBookmark, getUserBookmarks, removeBookmark } from '../../repositories/bookmarkRepository';
import { getAllEvents, subscribeToAllEvents } from '../../repositories/eventRepository';
import { getClubById } from '../../repositories/clubRepository';
import { colors, spacing, typography } from '../../theme';
import { sortEventsByDate } from '../../utils/eventDate';

export default function EventsScreen({ navigation }) {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [bookmarkLoadingId, setBookmarkLoadingId] = useState(null);

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
  }, [loadEvents]));

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
            <Text style={styles.emptyTitle}>No events available at the moment.</Text>
            <Text style={styles.emptyMessage}>Events will appear here once they are created.</Text>
          </View>
        }
        ListHeaderComponent={<Text style={styles.heading}>Events</Text>}
        renderItem={({ item }) => (
          <EventCard event={item} bookmarked={bookmarkedIds.has(item.id)} bookmarkLoading={bookmarkLoadingId === item.id} onBookmark={() => toggleBookmark(item.id)} onPress={() => navigation.navigate('EventDetails', { eventId: item.id })} />
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
