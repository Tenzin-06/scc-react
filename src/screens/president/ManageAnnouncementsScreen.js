import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AnnouncementCard from '../../components/AnnouncementCard';
import { useAuth } from '../../contexts/AuthContext';
import { createAnnouncement, deleteAnnouncement, getAnnouncementsByClub, updateAnnouncement } from '../../repositories/announcementRepository';
import { colors, spacing, typography } from '../../theme';

export default function ManageAnnouncementsScreen() {
  const { user } = useAuth();
  const { userProfile } = useAuth();
  const clubId = userProfile?.presidentOf;
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState({ title: '', message: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadAnnouncements = useCallback(async () => {
    if (!clubId) { setLoading(false); return; }
    try { setAnnouncements(await getAnnouncementsByClub(clubId)); }
    catch (error) { setMessage(error.message || 'Unable to load announcements.'); }
    finally { setLoading(false); }
  }, [clubId]);
  useEffect(() => { loadAnnouncements(); }, [loadAnnouncements]);

  async function save() {
    setMessage('');
    try {
      if (editingId) await updateAnnouncement(editingId, form);
      else await createAnnouncement({ ...form, clubId, createdBy: user.uid });
      setForm({ title: '', message: '' }); setEditingId(null); await loadAnnouncements(); setMessage('Announcement saved successfully.');
    } catch (error) { setMessage(error.message || 'Unable to save announcement.'); }
  }

  function remove(item) {
    Alert.alert('Delete announcement?', item.title, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { try { await deleteAnnouncement(item.id); await loadAnnouncements(); } catch (error) { setMessage(error.message); } } },
    ]);
  }

  if (loading) return <SafeAreaView style={styles.centered}><ActivityIndicator color={colors.primary} size="large" /></SafeAreaView>;
  return <SafeAreaView style={styles.container}><FlatList contentContainerStyle={styles.content} data={announcements} keyExtractor={(item) => item.id} ListHeaderComponent={<View><Text style={styles.title}>{editingId ? 'Edit Announcement' : 'Create Announcement'}</Text><TextInput onChangeText={(value) => setForm((current) => ({ ...current, title: value }))} placeholder="Title" placeholderTextColor={colors.secondaryText} style={styles.input} value={form.title} /><TextInput multiline onChangeText={(value) => setForm((current) => ({ ...current, message: value }))} placeholder="Message" placeholderTextColor={colors.secondaryText} style={[styles.input, styles.multiline]} value={form.message} /><Pressable onPress={save} style={styles.button}><Text style={styles.buttonText}>{editingId ? 'Update Announcement' : 'Create Announcement'}</Text></Pressable>{editingId ? <Pressable onPress={() => { setEditingId(null); setForm({ title: '', message: '' }); }}><Text style={styles.cancel}>Cancel edit</Text></Pressable> : null}<Text style={styles.message}>{message}</Text><Text style={styles.section}>Your Announcements</Text></View>} ListEmptyComponent={<Text style={styles.empty}>No announcements for this club yet.</Text>} renderItem={({ item }) => <View><AnnouncementCard announcement={item} /><View style={styles.row}><Pressable onPress={() => { setEditingId(item.id); setForm({ title: item.title || '', message: item.message || '' }); }}><Text style={styles.link}>Edit</Text></Pressable><Pressable onPress={() => remove(item)}><Text style={styles.delete}>Delete</Text></Pressable></View></View>} /></SafeAreaView>;
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.lg },
  centered: { alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center' },
  title: { color: colors.text, ...typography.screenTitle },
  section: { color: colors.text, marginVertical: spacing.lg, ...typography.sectionHeading },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 10, borderWidth: 1, color: colors.text, marginTop: spacing.sm, padding: spacing.md },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  button: { backgroundColor: colors.primary, borderRadius: 10, marginTop: spacing.md, padding: spacing.md },
  buttonText: { color: colors.white, fontWeight: '600', textAlign: 'center' },
  cancel: { color: colors.primary, marginTop: spacing.md, textAlign: 'center' },
  message: { color: colors.secondaryText, marginTop: spacing.sm, textAlign: 'center', ...typography.caption },
  empty: { color: colors.secondaryText, textAlign: 'center', ...typography.secondary },
  row: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: spacing.md },
  link: { color: colors.primary, fontWeight: '600', marginRight: spacing.lg },
  delete: { color: '#D91C2B', fontWeight: '600' },
});
