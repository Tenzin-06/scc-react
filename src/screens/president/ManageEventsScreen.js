import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EventCard from '../../components/EventCard';
import { useAuth } from '../../contexts/AuthContext';
import { createEvent, deleteEvent, getAllEvents, updateEvent } from '../../repositories/eventRepository';
import { colors, spacing, typography } from '../../theme';

const emptyForm = { title: '', description: '', date: '', time: '', location: '', imageUrl: '' };

export default function ManageEventsScreen() {
  const { userProfile } = useAuth();
  const clubId = userProfile?.presidentOf;
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadEvents = useCallback(async () => {
    if (!clubId) { setLoading(false); return; }
    try {
      const all = await getAllEvents();
      setEvents(all.filter((event) => event.clubId === clubId));
    } catch (error) { setMessage(error.message || 'Unable to load events.'); }
    finally { setLoading(false); }
  }, [clubId]);
  useEffect(() => { loadEvents(); }, [loadEvents]);

  async function saveEvent() {
    setSaving(true); setMessage('');
    try {
      if (editingId) {
        await updateEvent(editingId, form);
      } else {
        await createEvent({ ...form, clubId });
      }
      setForm(emptyForm); setEditingId(null); await loadEvents(); setMessage('Event saved successfully.');
    } catch (error) { setMessage(error.message || 'Unable to save event.'); }
    finally { setSaving(false); }
  }

  function removeEvent(event) {
    Alert.alert('Delete event?', event.title, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await deleteEvent(event.id); await loadEvents(); } catch (error) { setMessage(error.message); }
      } },
    ]);
  }

  if (loading) return <SafeAreaView style={styles.centered}><ActivityIndicator color={colors.primary} size="large" /></SafeAreaView>;
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        contentContainerStyle={styles.content}
        data={events}
        keyExtractor={(event) => event.id}
        ListHeaderComponent={<View>
          <Text style={styles.title}>{editingId ? 'Edit Event' : 'Create Event'}</Text>
          {['title', 'description', 'date', 'time', 'location', 'imageUrl'].map((field) => (
            <TextInput key={field} multiline={field === 'description'} onChangeText={(value) => setForm((current) => ({ ...current, [field]: value }))} placeholder={field} placeholderTextColor={colors.secondaryText} style={[styles.input, field === 'description' && styles.multiline]} value={form[field]} />
          ))}
          <Pressable disabled={saving} onPress={saveEvent} style={styles.button}><Text style={styles.buttonText}>{saving ? 'Saving...' : editingId ? 'Update Event' : 'Create Event'}</Text></Pressable>
          {editingId ? <Pressable onPress={() => { setEditingId(null); setForm(emptyForm); }}><Text style={styles.cancel}>Cancel edit</Text></Pressable> : null}
          <Text style={styles.message}>{message}</Text>
          <Text style={styles.section}>Your Events</Text>
        </View>}
        ListEmptyComponent={<Text style={styles.empty}>No events for this club yet.</Text>}
        renderItem={({ item }) => <View><EventCard event={item} /><View style={styles.row}><Pressable onPress={() => { setEditingId(item.id); setForm({ title: item.title || '', description: item.description || '', date: item.date || '', time: item.time || '', location: item.location || '', imageUrl: item.imageUrl || '' }); }}><Text style={styles.link}>Edit</Text></Pressable><Pressable onPress={() => removeEvent(item)}><Text style={styles.delete}>Delete</Text></Pressable></View></View>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.lg },
  centered: { alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center' },
  title: { color: colors.text, ...typography.screenTitle },
  section: { color: colors.text, marginVertical: spacing.lg, ...typography.sectionHeading },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 10, borderWidth: 1, color: colors.text, marginTop: spacing.sm, padding: spacing.md },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  button: { backgroundColor: colors.primary, borderRadius: 10, marginTop: spacing.md, padding: spacing.md },
  buttonText: { color: colors.white, fontWeight: '600', textAlign: 'center' },
  cancel: { color: colors.primary, marginTop: spacing.md, textAlign: 'center' },
  message: { color: colors.secondaryText, marginTop: spacing.sm, textAlign: 'center', ...typography.caption },
  empty: { color: colors.secondaryText, textAlign: 'center', ...typography.secondary },
  row: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: spacing.md },
  link: { color: colors.primary, fontWeight: '600', marginRight: spacing.lg },
  delete: { color: '#D91C2B', fontWeight: '600' },
});
