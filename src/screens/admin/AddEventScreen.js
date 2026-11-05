import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

import { AuthSelect } from '../../components/auth/AuthSelect';
import { createEvent } from '../../repositories/eventRepository';
import { updateEvent } from '../../repositories/eventRepository';
import { getAllClubs } from '../../repositories/clubRepository';
import { colors, spacing, typography } from '../../theme';

const fields = ['title', 'description', 'location', 'imageUrl'];

export default function AddEventScreen({ navigation, route }) {
  const editingEvent = route.params?.event;
  const [form, setForm] = useState({ title: editingEvent?.title || '', description: editingEvent?.description || '', date: editingEvent?.date || '', time: editingEvent?.time || '', location: editingEvent?.location || '', clubId: editingEvent?.clubId || '', imageUrl: editingEvent?.imageUrl || '' });
  const [clubs, setClubs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [picker, setPicker] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    getAllClubs().then(setClubs).catch((error) => setMessage(error.message || 'Unable to load clubs.'));
  }, []);

  async function save() {
    setSaving(true);
    setMessage('');
    try {
      if (editingEvent) await updateEvent(editingEvent.id, form);
      else await createEvent(form);
      navigation.goBack();
    } catch (error) {
      setMessage(error.message || 'Unable to add event.');
    } finally {
      setSaving(false);
    }

  }

  function updateDate(event, date) {
    setPicker(null);
    if (!date) return;
    setSelectedDate(date);
    setForm((current) => ({ ...current, date: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }));
  }

  function updateTime(event, time) {
    setPicker(null);
    if (!time) return;
    setForm((current) => ({ ...current, time: time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }));
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{editingEvent ? 'Edit Event' : 'Add Event'}</Text>
        <Text style={styles.hint}>Choose the event date, time, and club.</Text>
        {fields.map((field) => (
          <TextInput key={field} multiline={field === 'description'} onChangeText={(value) => setForm((current) => ({ ...current, [field]: value }))} placeholder={field === 'clubId' ? 'Club ID' : field} placeholderTextColor={colors.secondaryText} style={[styles.input, field === 'description' && styles.multiline]} value={form[field]} />
        ))}
        <Pressable onPress={() => setPicker('date')} style={styles.selector}>
          <Text style={form.date ? styles.selectorText : styles.placeholder}>{form.date || 'Select date'}</Text>
          <Text style={styles.selectorIcon}>Calendar</Text>
        </Pressable>
        <Pressable onPress={() => setPicker('time')} style={styles.selector}>
          <Text style={form.time ? styles.selectorText : styles.placeholder}>{form.time || 'Select time'}</Text>
          <Text style={styles.selectorIcon}>Clock</Text>
        </Pressable>
        <AuthSelect
          label="Club"
          onValueChange={(clubName) => setForm((current) => ({
            ...current,
            clubId: clubs.find((club) => club.name === clubName)?.id || '',
          }))}
          options={clubs.map((club) => club.name)}
          placeholder="Select club"
          value={clubs.find((club) => club.id === form.clubId)?.name || ''}
        />
        {picker ? (
          <DateTimePicker
            display="default"
            mode={picker}
            onChange={picker === 'date' ? updateDate : updateTime}
            value={picker === 'date' ? selectedDate : new Date()}
          />
        ) : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <Pressable disabled={saving} onPress={save} style={styles.button}><Text style={styles.buttonText}>{saving ? 'Saving...' : editingEvent ? 'Update Event' : 'Add Event'}</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.lg },
  title: { color: colors.text, marginBottom: spacing.md, ...typography.screenTitle },
  hint: { color: colors.secondaryText, marginBottom: spacing.sm, ...typography.caption },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 10, borderWidth: 1, color: colors.text, marginBottom: spacing.sm, padding: spacing.md },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  message: { color: '#B42318', marginBottom: spacing.sm, textAlign: 'center' },
  button: { backgroundColor: colors.primary, borderRadius: 10, padding: spacing.md },
  buttonText: { color: colors.white, fontWeight: '600', textAlign: 'center' },
  selector: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 10, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm, padding: spacing.md },
  selectorText: { color: colors.text },
  placeholder: { color: colors.secondaryText },
  selectorIcon: { color: colors.primary, fontWeight: '600' },
});
