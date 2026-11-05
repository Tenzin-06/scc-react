import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthSelect } from '../../components/auth/AuthSelect';
import { createClub, updateClub } from '../../repositories/clubRepository';
import { getAdminUsers } from '../../repositories/adminRepository';
import { colors, spacing, typography } from '../../theme';

const categories = ['Academic', 'Arts and Culture', 'Sports', 'Technology', 'Social Service', 'Other'];

export default function AddClubScreen({ navigation, route }) {
  const editingClub = route.params?.club;
  const [form, setForm] = useState({ name: editingClub?.name || '', description: editingClub?.description || '', category: editingClub?.category || '', presidentId: editingClub?.presidentId || '', imageUrl: editingClub?.imageUrl || '' });
  const [presidents, setPresidents] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    getAdminUsers()
      .then((users) => setPresidents(users.filter((user) => user.role?.toLowerCase() === 'president')))
      .catch((error) => setMessage(error.message || 'Unable to load presidents.'));
  }, []);

  async function save() {
    setSaving(true);
    setMessage('');
    try {
      if (editingClub) await updateClub(editingClub.id, form);
      else await createClub(form);
      navigation.goBack();
    } catch (error) {
      setMessage(error.message || 'Unable to add club.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{editingClub ? 'Edit Club' : 'Add Club'}</Text>
        {['name', 'description'].map((field) => (
          <TextInput
            key={field}
            multiline={field === 'description'}
            onChangeText={(value) => setForm((current) => ({ ...current, [field]: value }))}
            placeholder={field === 'name' ? 'Club name' : 'Description'}
            placeholderTextColor={colors.secondaryText}
            style={[styles.input, field === 'description' && styles.multiline]}
            value={form[field]}
          />
        ))}
        <AuthSelect
          label="Category"
          onValueChange={(value) => setForm((current) => ({ ...current, category: value }))}
          options={categories}
          placeholder="Select category"
          value={form.category}
        />
        <AuthSelect
          label="President"
          onValueChange={(presidentName) => setForm((current) => ({
            ...current,
            presidentId: presidents.find((president) => (president.fullName || president.email) === presidentName)?.id || '',
          }))}
          options={presidents.map((president) => president.fullName || president.email)}
          placeholder="Select president"
          value={presidents.find((president) => president.id === form.presidentId)?.fullName || presidents.find((president) => president.id === form.presidentId)?.email || ''}
        />
        <TextInput
          onChangeText={(value) => setForm((current) => ({ ...current, imageUrl: value }))}
          placeholder="Image URL (optional)"
          placeholderTextColor={colors.secondaryText}
          style={styles.input}
          value={form.imageUrl}
        />
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <Pressable disabled={saving} onPress={save} style={styles.button}>
          <Text style={styles.buttonText}>{saving ? 'Saving...' : editingClub ? 'Update Club' : 'Add Club'}</Text>
        </Pressable>
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
