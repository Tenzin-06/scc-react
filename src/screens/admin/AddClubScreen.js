import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthSelect } from '../../components/auth/AuthSelect';
import { saveClubWithPresident } from '../../repositories/clubRepository';
import { getAdminUsers } from '../../repositories/adminRepository';
import { colors, componentStyles, spacing, typography } from '../../theme';

const categories = ['Academic', 'Arts and Culture', 'Sports', 'Technology', 'Social Service', 'Other'];

export default function AddClubScreen({ navigation, route }) {
  const editingClub = route.params?.club;
  const [form, setForm] = useState({ name: editingClub?.name || '', description: editingClub?.description || '', category: editingClub?.category || '', presidentId: editingClub?.presidentId || '', imageUrl: editingClub?.imageUrl || '' });
  const [users, setUsers] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const [studentsError, setStudentsError] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    let active = true;
    async function loadUsers() {
      setUsersLoading(true);
      try {
        const nextUsers = await getAdminUsers();
        if (active) setUsers(nextUsers);
      } catch (error) {
        if (active) setStudentsError(error.message || 'Unable to load students.');
      } finally {
        if (active) setUsersLoading(false);
      }
    }
    loadUsers();
    return () => { active = false; };
  }, []);

  const students = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    return users
      .filter((user) => typeof user.role === 'string' && user.role.trim().toLowerCase() === 'student')
      .filter((user) => !query || [user.fullName, user.email, user.studentId]
        .some((value) => typeof value === 'string' && value.toLowerCase().includes(query)))
      .sort((first, second) => (first.fullName || '').localeCompare(second.fullName || ''))
      .slice(0, 10);
  }, [studentSearch, users]);
  const selectedStudent = users.find((user) => (user.id || user.uid) === form.presidentId);

  async function save() {
    setSaving(true);
    setMessage('');
    try {
      await saveClubWithPresident(form, editingClub?.id);
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
        <Text style={styles.presidentLabel}>President</Text>
        <Pressable
          accessibilityLabel={`President: ${selectedStudent?.fullName || 'Select a student'}`}
          accessibilityRole="button"
          accessibilityState={{ expanded: showStudentDropdown }}
          onPress={() => setShowStudentDropdown((current) => !current)}
          style={styles.dropdownTrigger}
        >
          <Text numberOfLines={1} style={selectedStudent ? styles.dropdownValue : styles.dropdownPlaceholder}>
            {selectedStudent?.fullName || 'Select a student'}
          </Text>
          <Text style={styles.dropdownHint}>{showStudentDropdown ? 'Close' : 'Choose'}</Text>
        </Pressable>
        {showStudentDropdown ? (
          <View style={styles.dropdown}>
            <TextInput
              accessibilityLabel="Search students to select as club president"
              autoCapitalize="none"
              onChangeText={setStudentSearch}
              placeholder="Search students by name, email, or ID"
              placeholderTextColor={colors.secondaryText}
              style={styles.studentSearch}
              value={studentSearch}
            />
            <View style={styles.studentList}>
              {usersLoading ? <Text style={styles.listMessage}>Loading students...</Text> : null}
              {!usersLoading && studentsError ? <Text style={styles.listMessage}>{studentsError}</Text> : null}
              {!usersLoading && !studentsError && students.length === 0 ? (
                <Text style={styles.listMessage}>{studentSearch.trim() ? 'No students match that search.' : 'No student accounts found.'}</Text>
              ) : null}
              {!usersLoading && !studentsError ? students.map((student) => {
                const studentId = student.id || student.uid;
                const selected = studentId === form.presidentId;
                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    key={studentId}
                    onPress={() => {
                      setForm((current) => ({ ...current, presidentId: studentId }));
                      setShowStudentDropdown(false);
                    }}
                    style={({ pressed }) => [styles.studentOption, selected && styles.selectedOption, pressed && componentStyles.pressed]}
                  >
                    <View style={styles.studentCopy}>
                      <Text numberOfLines={1} style={styles.studentName}>{student.fullName || 'Unnamed student'}</Text>
                      <Text numberOfLines={1} style={styles.studentMeta}>{student.email || student.studentId || 'Student account'}</Text>
                    </View>
                    <View style={[styles.radio, selected && styles.radioSelected]}>
                      {selected ? <View style={styles.radioDot} /> : null}
                    </View>
                  </Pressable>
                );
              }) : null}
            </View>
          </View>
        ) : null}
        <TextInput
          onChangeText={(value) => setForm((current) => ({ ...current, imageUrl: value }))}
          placeholder="Image URL (optional)"
          placeholderTextColor={colors.secondaryText}
          style={styles.input}
          value={form.imageUrl}
        />
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <Pressable disabled={saving} onPress={save} style={({ pressed }) => [styles.button, pressed && componentStyles.pressed, saving && componentStyles.disabled]}>
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
  input: [componentStyles.input, { marginBottom: spacing.sm }],
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  presidentLabel: { color: colors.text, marginBottom: spacing.xs, ...typography.label },
  dropdownTrigger: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 10, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm, minHeight: 48, paddingHorizontal: spacing.md },
  dropdownValue: { color: colors.text, flex: 1, ...typography.body },
  dropdownPlaceholder: { color: colors.secondaryText, flex: 1, ...typography.body },
  dropdownHint: { color: colors.primary, marginLeft: spacing.md, ...typography.label },
  dropdown: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 10, borderWidth: 1, marginBottom: spacing.lg, padding: spacing.sm },
  studentSearch: [componentStyles.input, { marginBottom: spacing.sm }],
  studentList: {},
  studentOption: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderWidth: 1, flexDirection: 'row', marginBottom: spacing.xs, minHeight: 58, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  selectedOption: { borderColor: colors.primary, borderWidth: 2 },
  studentCopy: { flex: 1, minWidth: 0 },
  studentName: { color: colors.text, ...typography.secondary, fontWeight: '600' },
  studentMeta: { color: colors.secondaryText, marginTop: 2, ...typography.caption },
  radio: { alignItems: 'center', borderColor: colors.border, borderRadius: 10, borderWidth: 1.5, height: 20, justifyContent: 'center', marginLeft: spacing.md, width: 20 },
  radioSelected: { borderColor: colors.primary },
  radioDot: { backgroundColor: colors.primary, borderRadius: 5, height: 10, width: 10 },
  listMessage: { color: colors.secondaryText, paddingVertical: spacing.md, ...typography.secondary },
  message: { color: colors.dark, marginBottom: spacing.sm, textAlign: 'center' },
  button: componentStyles.primaryButton,
  buttonText: componentStyles.primaryButtonText,
});
