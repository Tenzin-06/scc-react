import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ActionMenuModal from '../../components/ActionMenuModal';
import AnnouncementCard from '../../components/AnnouncementCard';
import AppIcon from '../../components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import { createAnnouncement, deleteAnnouncement, getAnnouncementsByClub, updateAnnouncement } from '../../repositories/announcementRepository';
import { getClubById } from '../../repositories/clubRepository';
import { colors, componentStyles, spacing, typography } from '../../theme';

const emptyForm = { title: '', message: '' };

export default function ManageAnnouncementsScreen() {
  const { user, userProfile } = useAuth();
  const clubId = userProfile?.presidentOf;
  const [announcements, setAnnouncements] = useState([]);
  const [clubName, setClubName] = useState('Your club');
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    if (!clubId) { setAnnouncements([]); setLoading(false); return; }
    setLoading(true);
    try {
      const [items, club] = await Promise.all([getAnnouncementsByClub(clubId), getClubById(clubId)]);
      setAnnouncements(items); setClubName(club?.name || 'Your club');
    } catch (error) { setMessage(error.message || 'Unable to load announcements.'); }
    finally { setLoading(false); }
  }, [clubId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = useMemo(() => announcements.filter((item) => item.title?.toLowerCase().includes(search.trim().toLowerCase())), [announcements, search]);

  async function save() {
    setSaving(true); setMessage('');
    try {
      if (editingId) await updateAnnouncement(editingId, form);
      else await createAnnouncement({ ...form, clubId, createdBy: user.uid });
      setForm(emptyForm); setEditingId(null); setShowForm(false); await load(); setMessage('Announcement saved successfully.');
    } catch (error) { setMessage(error.message || 'Unable to save announcement.'); }
    finally { setSaving(false); }
  }

  function edit(item) {
    setSelectedAnnouncement(null); setEditingId(item.id); setForm({ title: item.title || '', message: item.message || '' }); setShowForm(true);
  }

  function remove(item) {
    setSelectedAnnouncement(null);
    Alert.alert('Delete announcement?', item.title, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { try { await deleteAnnouncement(item.id); await load(); } catch (error) { setMessage(error.message || 'Unable to delete announcement.'); } } },
    ]);
  }

  if (loading) return <SafeAreaView style={styles.centered}><ActivityIndicator color={colors.primary} size="large" /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        contentContainerStyle={styles.content}
        data={showForm ? [] : filtered}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={<View>
          <Text style={styles.title}>Announcements</Text>
          <Text style={styles.subtitle}>{clubName} updates</Text>
          {showForm ? <View style={styles.formCard}>
            <Text style={styles.formTitle}>{editingId ? 'Edit announcement' : 'Create an announcement'}</Text>
            <Text style={styles.label}>Title</Text>
            <TextInput accessibilityLabel="Announcement title" onChangeText={(value) => setForm((current) => ({ ...current, title: value }))} placeholder="Title" placeholderTextColor={colors.secondaryText} style={styles.input} value={form.title} />
            <Text style={styles.label}>Message</Text>
            <TextInput accessibilityLabel="Announcement message" multiline onChangeText={(value) => setForm((current) => ({ ...current, message: value }))} placeholder="Message" placeholderTextColor={colors.secondaryText} style={[styles.input, styles.multiline]} value={form.message} />
            <Pressable accessibilityRole="button" disabled={saving} onPress={save} style={({ pressed }) => [styles.saveButton, pressed && !saving && styles.pressed, saving && styles.disabled]}><Text style={styles.saveText}>{saving ? 'Saving...' : editingId ? 'Update announcement' : 'Create announcement'}</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }} style={styles.cancelButton}><Text style={styles.cancelText}>Cancel</Text></Pressable>
          </View> : <>
            <TextInput accessibilityLabel="Search announcements" onChangeText={setSearch} placeholder="Search announcements" placeholderTextColor={colors.secondaryText} style={styles.search} value={search} />
            {message ? <Text style={styles.message}>{message}</Text> : null}
          </>}
        </View>}
        ListEmptyComponent={<Text style={styles.empty}>{showForm ? '' : search ? 'No announcements found.' : 'No announcements for this club yet.'}</Text>}
        renderItem={({ item }) => <AnnouncementCard announcement={{ ...item, clubName }} onMenu={() => setSelectedAnnouncement(item)} />}
        showsVerticalScrollIndicator={false}
      />
      {!showForm ? <Pressable accessibilityLabel="Add announcement" accessibilityRole="button" onPress={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }} style={({ pressed }) => [styles.floatingAdd, pressed && styles.pressed]}><AppIcon color={colors.white} name="add" size={24} /></Pressable> : null}
      <ActionMenuModal itemName={selectedAnnouncement?.title || 'announcement'} onClose={() => setSelectedAnnouncement(null)} onDelete={() => selectedAnnouncement && remove(selectedAnnouncement)} onEdit={() => selectedAnnouncement && edit(selectedAnnouncement)} visible={Boolean(selectedAnnouncement)} />
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
  label: { color: colors.text, marginBottom: spacing.xs, marginTop: spacing.md, ...typography.label },
  input: { ...componentStyles.input, backgroundColor: colors.surface, minHeight: 50 },
  multiline: { minHeight: 120, textAlignVertical: 'top' },
  saveButton: { ...componentStyles.primaryButton, marginTop: spacing.lg },
  saveText: { color: colors.white, ...typography.label },
  cancelButton: { alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm, minHeight: 44 },
  cancelText: { color: colors.primary, ...typography.label },
  floatingAdd: { ...componentStyles.primaryButton, alignItems: 'center', borderRadius: 28, bottom: spacing.xl, height: 56, justifyContent: 'center', paddingHorizontal: 0, position: 'absolute', right: spacing.lg, width: 56 },
  disabled: componentStyles.disabled,
  pressed: componentStyles.pressed,
});
