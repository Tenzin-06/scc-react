import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../contexts/AuthContext';
import { getClubById, updateClub } from '../../repositories/clubRepository';
import { colors, spacing, typography } from '../../theme';

export default function ManageClubScreen() {
  const { userProfile } = useAuth();
  const clubId = userProfile?.presidentOf;
  const [club, setClub] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', category: '', imageUrl: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadClub = useCallback(async () => {
    if (!clubId) { setLoading(false); return; }
    try {
      const result = await getClubById(clubId);
      setClub(result);
      if (result) setForm({ name: result.name || '', description: result.description || '', category: result.category || '', imageUrl: result.imageUrl || '' });
    } catch (error) { setMessage(error.message); } finally { setLoading(false); }
  }, [clubId]);
  useEffect(() => { loadClub(); }, [loadClub]);

  async function save() {
    setSaving(true); setMessage('');
    try {
      await updateClub(clubId, form);
      setClub((current) => ({ ...current, ...form }));
      setMessage('Club information updated successfully.');
    } catch (error) { setMessage(error.message || 'Unable to update club information.'); }
    finally { setSaving(false); }
  }

  if (loading) return <SafeAreaView style={styles.centered}><ActivityIndicator color={colors.primary} size="large" /></SafeAreaView>;
  if (!clubId || !club) return <SafeAreaView style={styles.centered}><Text style={styles.title}>Assigned club unavailable.</Text><Text style={styles.message}>{message || 'Ask an administrator to assign your club.'}</Text></SafeAreaView>;
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Manage Club</Text>
        {['name', 'description', 'category', 'imageUrl'].map((field) => (
          <TextInput
            key={field}
            multiline={field === 'description'}
            onChangeText={(value) => setForm((current) => ({ ...current, [field]: value }))}
            placeholder={field === 'imageUrl' ? 'Image URL (optional)' : field[0].toUpperCase() + field.slice(1)}
            placeholderTextColor={colors.secondaryText}
            style={[styles.input, field === 'description' && styles.multiline]}
            value={form[field]}
          />
        ))}
        <Text style={styles.message}>{message}</Text>
        <Pressable disabled={saving} onPress={save} style={styles.button}><Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save Changes'}</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.lg },
  centered: { alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center', padding: spacing.xxl },
  title: { color: colors.text, textAlign: 'center', ...typography.screenTitle },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 10, borderWidth: 1, color: colors.text, marginTop: spacing.md, padding: spacing.md },
  multiline: { minHeight: 110, textAlignVertical: 'top' },
  message: { color: colors.secondaryText, marginTop: spacing.md, textAlign: 'center', ...typography.secondary },
  button: { backgroundColor: colors.primary, borderRadius: 10, marginTop: spacing.lg, padding: spacing.md },
  buttonText: { color: colors.white, fontWeight: '600', textAlign: 'center' },
});
