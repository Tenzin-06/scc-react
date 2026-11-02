import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getAdminUsers } from '../../repositories/adminRepository';
import { updateUserProfileAsAdmin } from '../../repositories/userRepository';
import { colors, spacing, typography } from '../../theme';

const roles = ['all', 'student', 'president', 'admin'];

export default function ManageUsersScreen() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true); setError('');
    try { setUsers(await getAdminUsers()); }
    catch (loadError) { setError(loadError.message || 'Unable to load users.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadUsers(); }, [loadUsers]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = role === 'all' || user.role?.toLowerCase() === role;
      const matchesSearch = !term || [user.fullName, user.studentId, user.email]
        .some((value) => value?.toLowerCase().includes(term));
      return matchesRole && matchesSearch;
    });
  }, [role, search, users]);

  async function saveProfile() {
    if (!selected) return;
    setSaving(true);
    setError('');
    try {
      await updateUserProfileAsAdmin(selected.id || selected.uid, editForm);
      setUsers((current) => current.map((user) => (
        (user.id || user.uid) === (selected.id || selected.uid)
          ? { ...user, ...editForm }
          : user
      )));
      setSelected((current) => ({ ...current, ...editForm }));
    } catch (saveError) {
      setError(saveError.message || 'Unable to update user profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        contentContainerStyle={styles.content}
        data={filtered}
        keyExtractor={(item) => item.id || item.uid}
        ListHeaderComponent={<View>
          <TextInput onChangeText={setSearch} placeholder="Search name, ID, or email" placeholderTextColor={colors.secondaryText} style={styles.input} value={search} />
          <View style={styles.filters}>{roles.map((item) => <Pressable key={item} onPress={() => setRole(item)} style={[styles.chip, role === item && styles.activeChip]}><Text style={role === item ? styles.activeChipText : styles.chipText}>{item}</Text></Pressable>)}</View>
          {loading ? <ActivityIndicator color={colors.primary} size="large" style={styles.loader} /> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No users found.</Text> : null}
        renderItem={({ item }) => (
          <Pressable onPress={() => {
            setSelected(selected?.id === item.id ? null : item);
            setEditForm({
              fullName: item.fullName || '',
              email: item.email || '',
              studentId: item.studentId || '',
              programme: item.programme || '',
              department: item.department || '',
              semester: item.semester || '',
              phone: item.phone || '',
            });
          }} style={styles.card}>
            <Text style={styles.name}>{item.fullName || 'Unnamed user'}</Text>
            <Text style={styles.meta}>{item.email || 'No email'}  •  {item.role || 'No role'}</Text>
            {selected?.id === item.id ? (
              <View>
                {['fullName', 'email', 'studentId', 'programme', 'department', 'semester', 'phone'].map((field) => (
                  <TextInput
                    key={field}
                    onChangeText={(value) => setEditForm((current) => ({ ...current, [field]: value }))}
                    placeholder={field}
                    placeholderTextColor={colors.secondaryText}
                    style={styles.detailInput}
                    value={editForm[field]}
                  />
                ))}
                <Pressable disabled={saving} onPress={saveProfile} style={styles.saveButton}>
                  <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save Profile Fields'}</Text>
                </Pressable>
                <Text style={styles.details}>Role: {item.role || '-'} (role cannot be changed here)</Text>
              </View>
            ) : null}
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.lg },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 10, borderWidth: 1, color: colors.text, padding: spacing.md },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginVertical: spacing.md },
  chip: { backgroundColor: colors.chip, borderRadius: 20, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  activeChip: { backgroundColor: colors.primary },
  chipText: { color: colors.text },
  activeChipText: { color: colors.white },
  loader: { marginVertical: spacing.xl },
  error: { color: '#B42318', textAlign: 'center' },
  empty: { color: colors.secondaryText, paddingVertical: spacing.xxl, textAlign: 'center' },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 10, borderWidth: 1, marginTop: spacing.sm, padding: spacing.md },
  name: { color: colors.text, ...typography.cardTitle },
  meta: { color: colors.secondaryText, marginTop: spacing.xs, ...typography.caption },
  detailInput: { backgroundColor: colors.input, borderColor: colors.border, borderRadius: 8, borderWidth: 1, color: colors.text, marginTop: spacing.sm, padding: spacing.sm },
  saveButton: { backgroundColor: colors.primary, borderRadius: 8, marginTop: spacing.md, padding: spacing.sm },
  saveText: { color: colors.white, fontWeight: '600', textAlign: 'center' },
  details: { color: colors.text, lineHeight: 22, marginTop: spacing.md },
});
