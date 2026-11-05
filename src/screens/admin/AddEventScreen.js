import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

import { AuthSelect } from '../../components/auth/AuthSelect';
import { createEvent } from '../../repositories/eventRepository';
import { updateEvent } from '../../repositories/eventRepository';
import { getAllClubs } from '../../repositories/clubRepository';
import { colors, componentStyles, spacing, typography } from '../../theme';

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
        <Pressable accessibilityRole="button" onPress={() => setPicker('date')} style={({ pressed }) => [styles.selector, pressed && componentStyles.pressed]}>
          <Text style={form.date ? styles.selectorText : styles.placeholder}>{form.date || 'Select date'}</Text>
          <Text style={styles.selectorIcon}>Calendar</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => setPicker('time')} style={({ pressed }) => [styles.selector, pressed && componentStyles.pressed]}>
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
        <Pressable disabled={saving} onPress={save} style={({ pressed }) => [styles.button, pressed && componentStyles.pressed, saving && componentStyles.disabled]}><Text style={styles.buttonText}>{saving ? 'Saving...' : editingEvent ? 'Update Event' : 'Add Event'}</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.lg },
  title: { color: colors.text, marginBottom: spacing.md, ...typography.screenTitle },
  hint: { color: colors.secondaryText, marginBottom: spacing.sm, ...typography.caption },
  input: [componentStyles.input, { marginBottom: spacing.sm }],
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  message: { color: colors.dark, marginBottom: spacing.sm, textAlign: 'center' },
  button: componentStyles.primaryButton,
  buttonText: componentStyles.primaryButtonText,
  selector: { ...componentStyles.input, alignItems: 'center', backgroundColor: colors.surface, flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  selectorText: { color: colors.text },
  placeholder: { color: colors.secondaryText },
  selectorIcon: { color: colors.primary, fontWeight: '600' },
});
