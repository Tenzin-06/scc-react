import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ActionMenuModal from '../../components/ActionMenuModal';
import AppIcon from '../../components/AppIcon';
import EventCard from '../../components/EventCard';
import { useAuth } from '../../contexts/AuthContext';
import { createEvent, deleteEvent, getAllEvents, updateEvent } from '../../repositories/eventRepository';
import { getClubById } from '../../repositories/clubRepository';
import { colors, componentStyles, spacing, typography } from '../../theme';

const emptyForm = { title: '', description: '', date: '', time: '', location: '', imageUrl: '' };
const fields = [['title', 'Event title'], ['description', 'Description'], ['date', 'Date'], ['time', 'Time'], ['location', 'Location'], ['imageUrl', 'Image URL (optional)']];

export default function ManageEventsScreen() {
  const { userProfile } = useAuth();
  const clubId = userProfile?.presidentOf;
  const [events, setEvents] = useState([]);
  const [clubName, setClubName] = useState('Your club');
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    if (!clubId) { setEvents([]); setLoading(false); return; }
    setLoading(true);
    try {
      const [allEvents, club] = await Promise.all([getAllEvents(), getClubById(clubId)]);
      setEvents(allEvents.filter((event) => event.clubId === clubId));
      setClubName(club?.name || 'Your club');
    } catch (error) { setMessage(error.message || 'Unable to load events.'); }
    finally { setLoading(false); }
  }, [clubId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filteredEvents = useMemo(() => events.filter((event) => event.title?.toLowerCase().includes(search.trim().toLowerCase())), [events, search]);

  async function saveEvent() {
    setSaving(true); setMessage('');
    try {
      if (editingId) await updateEvent(editingId, form);
      else await createEvent({ ...form, clubId });
      setForm(emptyForm); setEditingId(null); setShowForm(false); await load(); setMessage('Event saved successfully.');
    } catch (error) { setMessage(error.message || 'Unable to save event.'); }
    finally { setSaving(false); }
  }

  function editEvent(event) {
    setSelectedEvent(null); setEditingId(event.id); setShowForm(true);
    setForm({ title: event.title || '', description: event.description || '', date: event.date || '', time: event.time || '', location: event.location || '', imageUrl: event.imageUrl || '' });
  }

  function removeEvent(event) {
    setSelectedEvent(null);
    Alert.alert('Delete event?', 'Existing registrations are not automatically deleted.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { try { await deleteEvent(event.id); await load(); } catch (error) { setMessage(error.message || 'Unable to delete event.'); } } },
    ]);
  }

  function startCreate() { setForm(emptyForm); setEditingId(null); setShowForm(true); }

  if (loading) return <SafeAreaView style={styles.centered}><ActivityIndicator color={colors.primary} size="large" /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        contentContainerStyle={styles.content}
        data={showForm ? [] : filteredEvents}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={<View>
          <Text style={styles.title}>Events</Text>
          <Text style={styles.subtitle}>{clubName} events</Text>
          {showForm ? <View style={styles.formCard}>
            <Text style={styles.formTitle}>{editingId ? 'Edit event' : 'Create an event'}</Text>
            {fields.map(([field, label]) => (
              <View key={field} style={styles.fieldGroup}>
                <Text style={styles.label}>{label}</Text>
                <TextInput accessibilityLabel={label} multiline={field === 'description'} onChangeText={(value) => setForm((current) => ({ ...current, [field]: value }))} placeholder={label} placeholderTextColor={colors.secondaryText} style={[styles.input, field === 'description' && styles.multiline]} value={form[field]} />
              </View>
            ))}
            <Pressable accessibilityRole="button" disabled={saving} onPress={saveEvent} style={({ pressed }) => [styles.saveButton, pressed && !saving && styles.pressed, saving && styles.disabled]}><Text style={styles.saveText}>{saving ? 'Saving...' : editingId ? 'Update event' : 'Create event'}</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }} style={styles.cancelButton}><Text style={styles.cancelText}>Cancel</Text></Pressable>
          </View> : <>
            <TextInput accessibilityLabel="Search events" onChangeText={setSearch} placeholder="Search events" placeholderTextColor={colors.secondaryText} style={styles.search} value={search} />
            {message ? <Text style={styles.message}>{message}</Text> : null}
          </>}
        </View>}
        ListEmptyComponent={<Text style={styles.empty}>{showForm ? '' : search ? 'No events found.' : 'No events for this club yet.'}</Text>}
        renderItem={({ item }) => <EventCard event={{ ...item, clubName }} onMenu={() => setSelectedEvent(item)} />}
        showsVerticalScrollIndicator={false}
      />
      {!showForm ? <Pressable accessibilityLabel="Add event" accessibilityRole="button" onPress={startCreate} style={({ pressed }) => [styles.floatingAdd, pressed && styles.pressed]}><AppIcon color={colors.white} name="add" size={24} /></Pressable> : null}
      <ActionMenuModal itemName={selectedEvent?.title || 'event'} onClose={() => setSelectedEvent(null)} onDelete={() => selectedEvent && removeEvent(selectedEvent)} onEdit={() => selectedEvent && editEvent(selectedEvent)} visible={Boolean(selectedEvent)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.lg, paddingBottom: 104 },
  centered: { alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center' },
  title: { color: colors.text, ...typography.screenTitle },
  subtitle: { color: colors.secondaryText, marginTop: spacing.xs, ...typography.secondary },
  search: { ...componentStyles.input, marginTop: spacing.md },
  message: { color: colors.secondaryText, marginTop: spacing.sm, textAlign: 'center', ...typography.caption },
  empty: { color: colors.secondaryText, paddingVertical: spacing.xxl, textAlign: 'center', ...typography.secondary },
  formCard: { ...componentStyles.card, marginTop: spacing.lg },
  formTitle: { color: colors.text, ...typography.sectionHeading },
  fieldGroup: { marginTop: spacing.md },
  label: { color: colors.text, marginBottom: spacing.xs, ...typography.label },
  input: { ...componentStyles.input, backgroundColor: colors.surface, minHeight: 50 },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  saveButton: { ...componentStyles.primaryButton, marginTop: spacing.lg },
  saveText: { color: colors.white, ...typography.label },
  cancelButton: { alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm, minHeight: 44 },
  cancelText: { color: colors.primary, ...typography.label },
  floatingAdd: { ...componentStyles.primaryButton, alignItems: 'center', borderRadius: 28, bottom: spacing.xl, height: 56, justifyContent: 'center', paddingHorizontal: 0, position: 'absolute', right: spacing.lg, width: 56 },
  disabled: componentStyles.disabled,
  pressed: componentStyles.pressed,
});
