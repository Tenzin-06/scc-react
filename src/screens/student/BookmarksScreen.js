import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ClubCard from '../../components/ClubCard';
import EventCard from '../../components/EventCard';
import { useAuth } from '../../contexts/AuthContext';
import { getClubById } from '../../repositories/clubRepository';
import { getBookmarkedClubs, getBookmarkedEvents, removeBookmark } from '../../repositories/bookmarkRepository';
import { colors, radii, spacing, typography } from '../../theme';

export default function BookmarksScreen({ navigation }) {
  const { user } = useAuth();
  const [tab, setTab] = useState('club');
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState(null);

  const loadBookmarks = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    setError('');
    try {
      const [savedClubs, savedEvents] = await Promise.all([
        getBookmarkedClubs(user.uid),
        getBookmarkedEvents(user.uid),
      ]);
      const eventsWithClubNames = await Promise.all(savedEvents.map(async (event) => {
        const club = event.clubId ? await getClubById(event.clubId).catch(() => null) : null;
        return { ...event, clubName: club?.name || 'Club information unavailable' };
      }));
      setClubs(savedClubs);
      setEvents(eventsWithClubNames);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load bookmarks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useFocusEffect(useCallback(() => { loadBookmarks(); }, [loadBookmarks]));

  async function remove(item) {
    if (removingId) return;
    setRemovingId(item.id);
    try {
      await removeBookmark(user.uid, item.id, tab);
      if (tab === 'club') setClubs((current) => current.filter((club) => club.id !== item.id));
      else setEvents((current) => current.filter((event) => event.id !== item.id));
    } catch (removeError) {
      Alert.alert('Bookmark could not be removed', removeError.message || 'Please try again.');
    } finally {
      setRemovingId(null);
    }
  }

  const items = tab === 'club' ? clubs : events;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        contentContainerStyle={styles.content}
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={loading || error ? null : <Text style={styles.empty}>No bookmarked {tab === 'club' ? 'clubs' : 'events'} yet.</Text>}
        ListHeaderComponent={(
          <View>
            <Text style={styles.description}>Saved clubs and events.</Text>
            <View style={styles.tabs}>
              {['club', 'event'].map((type) => (
                <Pressable key={type} accessibilityRole="tab" accessibilityState={{ selected: tab === type }} onPress={() => setTab(type)} style={({ pressed }) => [styles.tab, tab === type && styles.selectedTab, pressed && styles.pressed]}>
                  <Text style={[styles.tabText, tab === type && styles.selectedTabText]}>{type === 'club' ? 'Clubs' : 'Events'}</Text>
                </Pressable>
              ))}
            </View>
            {loading ? <ActivityIndicator color={colors.primary} size="large" style={styles.loader} /> : null}
            {error ? <Pressable accessibilityRole="button" onPress={loadBookmarks} style={styles.errorNotice}><Text style={styles.error}>{error} Tap to retry.</Text></Pressable> : null}
          </View>
        )}
        renderItem={({ item }) => tab === 'club' ? (
          <ClubCard club={item} compact onBookmark={() => remove(item)} bookmarkLoading={removingId === item.id} bookmarked onPress={() => navigation.navigate('ClubDetails', { clubId: item.id })} />
        ) : (
          <EventCard event={item} onBookmark={() => remove(item)} bookmarkLoading={removingId === item.id} bookmarked onPress={() => navigation.navigate('EventDetails', { eventId: item.id })} />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  description: { color: colors.secondaryText, ...typography.secondary },
  tabs: { backgroundColor: colors.chip, borderRadius: radii.pill, flexDirection: 'row', marginVertical: spacing.lg, padding: 3 },
  tab: { alignItems: 'center', borderRadius: radii.pill, flex: 1, minHeight: 44, justifyContent: 'center' },
  selectedTab: { backgroundColor: colors.primary },
  tabText: { color: colors.text, ...typography.label },
  selectedTabText: { color: colors.white },
  loader: { marginVertical: spacing.xl },
  empty: { color: colors.secondaryText, paddingVertical: spacing.xxxl, textAlign: 'center', ...typography.secondary },
  errorNotice: { backgroundColor: colors.chip, borderLeftColor: colors.dark, borderLeftWidth: 3, borderRadius: radii.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  error: { color: colors.dark, ...typography.secondary },
  pressed: { opacity: 0.78 },
});
