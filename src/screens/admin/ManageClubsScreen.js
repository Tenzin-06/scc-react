import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ClubCard from '../../components/ClubCard';
import { createClub, getAllClubs, updateClub } from '../../repositories/clubRepository';
import { colors, spacing, typography } from '../../theme';

const emptyForm = { name: '', description: '', category: '', imageUrl: '' };

export default function ManageClubsScreen() {
  const [clubs, setClubs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadClubs = useCallback(async () => {
    setLoading(true); setMessage('');
    try { setClubs(await getAllClubs()); }
    catch (error) { setMessage(error.message || 'Unable to load clubs.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadClubs(); }, [loadClubs]);

  const filtered = useMemo(() => clubs.filter((club) => club.name?.toLowerCase().includes(search.trim().toLowerCase())), [clubs, search]);
  async function save() {
    setSaving(true); setMessage('');
    try {
      if (editingId) await updateClub(editingId, form);
      else await createClub(form);
      setForm(emptyForm); setEditingId(null); await loadClubs(); setMessage('Club saved successfully.');
    } catch (error) { setMessage(error.message || 'Unable to save club.'); }
    finally { setSaving(false); }
  }
  function remove() {
    Alert.alert(
      'Club deletion unavailable',
      'Safe deletion is not implemented because memberships, events, and announcements require an approved cleanup strategy. No records were changed.',
      [{ text: 'OK' }],
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        contentContainerStyle={styles.content}
        data={filtered}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<View>
          <Text style={styles.title}>{editingId ? 'Edit Club' : 'Create Club'}</Text>
          {['name', 'description', 'category', 'imageUrl'].map((field) => <TextInput key={field} multiline={field === 'description'} onChangeText={(value) => setForm((current) => ({ ...current, [field]: value }))} placeholder={field === 'imageUrl' ? 'Image URL (optional)' : field} placeholderTextColor={colors.secondaryText} style={[styles.input, field === 'description' && styles.multiline]} value={form[field]} />)}
          <Pressable disabled={saving} onPress={save} style={styles.button}><Text style={styles.buttonText}>{saving ? 'Saving...' : editingId ? 'Update Club' : 'Create Club'}</Text></Pressable>
          {editingId ? <Pressable onPress={() => { setEditingId(null); setForm(emptyForm); }}><Text style={styles.cancel}>Cancel edit</Text></Pressable> : null}
          <TextInput onChangeText={setSearch} placeholder="Search clubs" placeholderTextColor={colors.secondaryText} style={styles.input} value={search} />
          {loading ? <ActivityIndicator color={colors.primary} size="large" style={styles.loader} /> : null}
          <Text style={styles.message}>{message}</Text>
        </View>}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No clubs found.</Text> : null}
        renderItem={({ item }) => <View><ClubCard club={item} onPress={() => { setEditingId(item.id); setForm({ name: item.name || '', description: item.description || '', category: item.category || '', imageUrl: item.imageUrl || '' }); }} /><View style={styles.row}><Text style={styles.meta}>President: {item.presidentId || 'Unassigned'}  •  Members: {item.memberCount || 0}</Text><Pressable onPress={() => remove(item)}><Text style={styles.delete}>Delete</Text></Pressable></View></View>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.lg },
  title: { color: colors.text, ...typography.screenTitle },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 10, borderWidth: 1, color: colors.text, marginTop: spacing.sm, padding: spacing.md },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  button: { backgroundColor: colors.primary, borderRadius: 10, marginTop: spacing.md, padding: spacing.md },
  buttonText: { color: colors.white, fontWeight: '600', textAlign: 'center' },
  cancel: { color: colors.primary, marginTop: spacing.sm, textAlign: 'center' },
  loader: { marginVertical: spacing.lg },
  message: { color: colors.secondaryText, marginTop: spacing.sm, textAlign: 'center' },
  empty: { color: colors.secondaryText, paddingVertical: spacing.xxl, textAlign: 'center' },
  row: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  meta: { color: colors.secondaryText, flex: 1, ...typography.caption },
  delete: { color: '#B42318', fontWeight: '600', padding: spacing.sm },
});
