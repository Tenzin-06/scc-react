import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AnnouncementCard from '../../components/AnnouncementCard';
import { getClubById } from '../../repositories/clubRepository';
import { getAllAnnouncements } from '../../repositories/announcementRepository';
import { colors, componentStyles, spacing, typography } from '../../theme';
import { getAnnouncementDate } from '../../utils/announcementDate';

export default function AnnouncementsScreen({ navigation }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const results = await getAllAnnouncements();
      const enriched = await Promise.all(results.map(async (announcement) => {
        const club = announcement.clubId ? await getClubById(announcement.clubId).catch(() => null) : null;
        return {
          ...announcement,
          clubName: club?.name || 'General announcement',
          date: getAnnouncementDate(announcement.createdAt),
        };
      }));
      setAnnouncements(enriched);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load announcements. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    loadAnnouncements();
  }, [loadAnnouncements]));

  if (loading) {
    return <SafeAreaView style={styles.centered}><ActivityIndicator color={colors.primary} size="large" /></SafeAreaView>;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.title}>Unable to load announcements.</Text>
        <Text style={styles.message}>{error}</Text>
        <Pressable accessibilityRole="button" onPress={loadAnnouncements} style={({ pressed }) => [styles.button, pressed && styles.pressed]}><Text style={styles.buttonText}>Retry</Text></Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        contentContainerStyle={styles.content}
        data={announcements}
        keyExtractor={(announcement) => announcement.id}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.title}>No announcements available at the moment.</Text></View>}
        renderItem={({ item }) => (
          <AnnouncementCard
            announcement={item}
            onPress={() => navigation.navigate('AnnouncementDetails', { announcementId: item.id })}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  centered: { alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center', padding: spacing.xxl },
  empty: { alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.xxxl },
  title: { color: colors.text, textAlign: 'center', ...typography.sectionHeading },
  message: { color: colors.secondaryText, marginTop: spacing.sm, textAlign: 'center', ...typography.secondary },
  button: { ...componentStyles.primaryButton, marginTop: spacing.xl },
  buttonText: { color: colors.white, ...typography.label },
  pressed: componentStyles.pressed,
});
