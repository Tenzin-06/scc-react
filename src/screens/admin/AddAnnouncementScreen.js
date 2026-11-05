import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../contexts/AuthContext';
import { AuthSelect } from '../../components/auth/AuthSelect';
import { createAnnouncement } from '../../repositories/announcementRepository';
import { updateAnnouncement } from '../../repositories/announcementRepository';
import { getAllClubs } from '../../repositories/clubRepository';
import { colors, spacing, typography } from '../../theme';

export default function AddAnnouncementScreen({ navigation, route }) {
  const { user } = useAuth();
  const editingAnnouncement = route.params?.announcement;
  const [form, setForm] = useState({ title: editingAnnouncement?.title || '', message: editingAnnouncement?.message || '', clubId: editingAnnouncement?.clubId || '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [clubs, setClubs] = useState([]);

  useEffect(() => {
    getAllClubs().then(setClubs).catch((error) => setMessage(error.message || 'Unable to load clubs.'));
  }, []);

  async function save() {
    setSaving(true);
    setMessage('');
    try {
      if (editingAnnouncement) await updateAnnouncement(editingAnnouncement.id, form);
      else await createAnnouncement({ ...form, createdBy: user.uid });
      navigation.goBack();
    } catch (error) {
      setMessage(error.message || 'Unable to add announcement.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{editingAnnouncement ? 'Edit Announcement' : 'Add Announcement'}</Text>
        <TextInput onChangeText={(value) => setForm((current) => ({ ...current, title: value }))} placeholder="Title" placeholderTextColor={colors.secondaryText} style={styles.input} value={form.title} />
        <TextInput multiline onChangeText={(value) => setForm((current) => ({ ...current, message: value }))} placeholder="Message" placeholderTextColor={colors.secondaryText} style={[styles.input, styles.multiline]} value={form.message} />
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
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <Pressable disabled={saving} onPress={save} style={styles.button}><Text style={styles.buttonText}>{saving ? 'Saving...' : editingAnnouncement ? 'Update Announcement' : 'Add Announcement'}</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.lg },
  title: { color: colors.text, marginBottom: spacing.md, ...typography.screenTitle },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 10, borderWidth: 1, color: colors.text, marginBottom: spacing.sm, padding: spacing.md },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  message: { color: '#B42318', marginBottom: spacing.sm, textAlign: 'center' },
  button: { backgroundColor: colors.primary, borderRadius: 10, padding: spacing.md },
  buttonText: { color: colors.white, fontWeight: '600', textAlign: 'center' },
});
