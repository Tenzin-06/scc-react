import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import ActionMenuModal from '../../components/ActionMenuModal';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppIcon from '../../components/AppIcon';
import ClubCard from '../../components/ClubCard';
import { getAllClubs } from '../../repositories/clubRepository';
import { colors, spacing, typography } from '../../theme';

export default function ManageClubsScreen({ navigation }) {
  const [clubs, setClubs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedClub, setSelectedClub] = useState(null);

  const loadClubs = useCallback(async () => {
    setLoading(true); setMessage('');
    try { setClubs(await getAllClubs()); }
    catch (error) { setMessage(error.message || 'Unable to load clubs.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => {
    loadClubs();
  }, [loadClubs]));

  const filtered = useMemo(() => clubs.filter((club) => club.name?.toLowerCase().includes(search.trim().toLowerCase())), [clubs, search]);
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
          <Text style={styles.title}>Clubs</Text>
          <TextInput onChangeText={setSearch} placeholder="Search clubs" placeholderTextColor={colors.secondaryText} style={styles.input} value={search} />
          {loading ? <ActivityIndicator color={colors.primary} size="large" style={styles.loader} /> : null}
          <Text style={styles.message}>{message}</Text>
        </View>}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No clubs found.</Text> : null}
        renderItem={({ item }) => <View><ClubCard club={item} onMenu={() => setSelectedClub(item)} /><View style={styles.row}><Text style={styles.meta}>President: {item.presidentId || 'Unassigned'}  •  Members: {item.memberCount || 0}</Text></View></View>}
      />
      <Pressable accessibilityLabel="Add club" accessibilityRole="button" onPress={() => navigation.navigate('AddClub')} style={styles.floatingAdd}>
        <AppIcon color={colors.white} name="add" size={24} />
      </Pressable>
      <ActionMenuModal
        itemName={selectedClub?.name || 'club'}
        onClose={() => setSelectedClub(null)}
        onDelete={() => { setSelectedClub(null); remove(selectedClub); }}
        onEdit={() => { const item = selectedClub; setSelectedClub(null); navigation.navigate('EditClub', { club: item }); }}
        visible={Boolean(selectedClub)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.lg, paddingBottom: 96 },
  title: { color: colors.text, ...typography.screenTitle },
  floatingAdd: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 28, bottom: spacing.xl, elevation: 5, height: 56, justifyContent: 'center', position: 'absolute', right: spacing.lg, shadowColor: '#000', shadowOffset: { height: 2, width: 0 }, shadowOpacity: 0.2, shadowRadius: 4, width: 56 },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 10, borderWidth: 1, color: colors.text, marginTop: spacing.sm, padding: spacing.md },
  loader: { marginVertical: spacing.lg },
  message: { color: colors.secondaryText, marginTop: spacing.sm, textAlign: 'center' },
  empty: { color: colors.secondaryText, paddingVertical: spacing.xxl, textAlign: 'center' },
  row: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  meta: { color: colors.secondaryText, flex: 1, ...typography.caption },
});
