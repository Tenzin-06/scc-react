import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../contexts/AuthContext';
import StickyActionBar from '../../components/StickyActionBar';
import { getClubById, updateClub } from '../../repositories/clubRepository';
import { colors, componentStyles, spacing, typography } from '../../theme';

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
      <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
        <Text style={styles.title}>Club information</Text>
        <Text style={styles.subtitle}>Update details students see when they discover your club.</Text>
        {[
          ['name', 'Club name'],
          ['description', 'Description'],
          ['category', 'Category'],
          ['imageUrl', 'Image URL (optional)'],
        ].map(([field, label]) => (
          <View key={field} style={styles.fieldGroup}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              accessibilityLabel={label}
              multiline={field === 'description'}
              onChangeText={(value) => setForm((current) => ({ ...current, [field]: value }))}
              placeholder={label}
              placeholderTextColor={colors.secondaryText}
              style={[styles.input, field === 'description' && styles.multiline]}
              value={form[field]}
            />
          </View>
        ))}
      </ScrollView>
      <StickyActionBar disabled={saving} loading={saving} message={message} onPress={save} title="Update club" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  centered: { alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center', padding: spacing.xxl },
  title: { color: colors.text, ...typography.screenTitle },
  subtitle: { color: colors.secondaryText, marginTop: spacing.xs, ...typography.secondary },
  message: { color: colors.secondaryText, marginTop: spacing.md, textAlign: 'center', ...typography.secondary },
  fieldGroup: { marginTop: spacing.lg },
  label: { color: colors.text, marginBottom: spacing.xs, ...typography.label },
  input: { ...componentStyles.input, backgroundColor: colors.surface, minHeight: 52 },
  multiline: { minHeight: 120, textAlignVertical: 'top' },
});
