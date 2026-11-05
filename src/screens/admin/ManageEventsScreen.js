import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import EventCard from '../../components/EventCard';
import ActionMenuModal from '../../components/ActionMenuModal';
import AppIcon from '../../components/AppIcon';
import { deleteEvent, getAllEvents } from '../../repositories/eventRepository';
import { getAllClubs } from '../../repositories/clubRepository';
import { colors, spacing, typography } from '../../theme';

export default function ManageEventsScreen({ navigation }) {
  const [events, setEvents] = useState([]); const [clubs, setClubs] = useState([]);
  const [search, setSearch] = useState(''); const [loading, setLoading] = useState(true); const [message, setMessage] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const load = useCallback(async () => { setLoading(true); try { const [nextEvents, nextClubs] = await Promise.all([getAllEvents(), getAllClubs()]); setEvents(nextEvents); setClubs(nextClubs); } catch (error) { setMessage(error.message || 'Unable to load events.'); } finally { setLoading(false); } }, []);
  useFocusEffect(useCallback(() => {
    load();
  }, [load]));
  const clubNames = useMemo(() => new Map(clubs.map((club) => [club.id, club.name])), [clubs]);
  const filtered = events.filter((event) => event.title?.toLowerCase().includes(search.trim().toLowerCase()));
  function remove(item) { Alert.alert('Delete event?', 'Existing registrations are not automatically deleted.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => { try { await deleteEvent(item.id); await load(); } catch (error) { setMessage(error.message || 'Unable to delete event.'); } } }]); }
  return <View style={styles.container}><FlatList contentContainerStyle={styles.content} data={filtered} keyExtractor={(item) => item.id} ListHeaderComponent={<View><Text style={styles.title}>Events</Text><TextInput onChangeText={setSearch} placeholder="Search events" placeholderTextColor={colors.secondaryText} style={styles.input} value={search} />{loading ? <ActivityIndicator color={colors.primary} size="large" style={styles.loader} /> : null}<Text style={styles.message}>{message}</Text></View>} ListEmptyComponent={<Text style={styles.empty}>No events found.</Text>} renderItem={({ item }) => <EventCard event={{ ...item, clubName: clubNames.get(item.clubId) || item.clubId }} onMenu={() => setSelectedEvent(item)} />} /><Pressable accessibilityLabel="Add event" accessibilityRole="button" onPress={() => navigation.navigate('AddEvent')} style={styles.floatingAdd}><AppIcon color={colors.white} name="add" size={24} /></Pressable><ActionMenuModal itemName={selectedEvent?.title || 'event'} onClose={() => setSelectedEvent(null)} onDelete={() => { setSelectedEvent(null); remove(selectedEvent); }} onEdit={() => { const item = selectedEvent; setSelectedEvent(null); navigation.navigate('EditEvent', { event: item }); }} visible={Boolean(selectedEvent)} /></View>;
}
const styles = StyleSheet.create({ container: { backgroundColor: colors.background, flex: 1 }, content: { padding: spacing.lg, paddingBottom: 96 }, title: { color: colors.text, ...typography.screenTitle }, formTitle: { color: colors.text, marginTop: spacing.lg, ...typography.sectionHeading }, input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 10, borderWidth: 1, color: colors.text, marginTop: spacing.sm, padding: spacing.md }, multiline: { minHeight: 80, textAlignVertical: 'top' }, button: { backgroundColor: colors.primary, borderRadius: 10, marginTop: spacing.md, padding: spacing.md }, buttonText: { color: colors.white, fontWeight: '600', textAlign: 'center' }, cancel: { color: colors.primary, marginTop: spacing.sm, textAlign: 'center' }, loader: { marginVertical: spacing.lg }, message: { color: colors.secondaryText, marginTop: spacing.sm, textAlign: 'center' }, empty: { color: colors.secondaryText, paddingVertical: spacing.xxl, textAlign: 'center' }, row: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: spacing.md }, link: { color: colors.primary, fontWeight: '600', marginRight: spacing.lg }, delete: { color: '#B42318', fontWeight: '600' }, floatingAdd: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 28, bottom: spacing.xl, elevation: 5, height: 56, justifyContent: 'center', position: 'absolute', right: spacing.lg, shadowColor: '#000', shadowOffset: { height: 2, width: 0 }, shadowOpacity: 0.2, shadowRadius: 4, width: 56 } });
