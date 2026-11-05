import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppIcon from '../../components/AppIcon';
import { getClubById } from '../../repositories/clubRepository';
import { getAnnouncementById } from '../../repositories/announcementRepository';
import { colors, componentStyles, spacing, typography } from '../../theme';
import { getAnnouncementDateTime } from '../../utils/announcementDate';

export default function AnnouncementDetailsScreen({ navigation, route }) {
  const announcementId = route?.params?.announcementId;
  const [announcement, setAnnouncement] = useState(null);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnnouncement = useCallback(async () => {
    if (!announcementId) {
      setError('This announcement could not be opened.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await getAnnouncementById(announcementId);
      if (!result) {
        setAnnouncement(null);
        return;
      }
      setAnnouncement(result);
      setClub(result.clubId ? await getClubById(result.clubId).catch(() => null) : null);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load the announcement. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [announcementId]);

  useEffect(() => {
    loadAnnouncement();
  }, [loadAnnouncement]);

  if (loading) {
    return <SafeAreaView style={styles.centered}><ActivityIndicator color={colors.primary} size="large" /></SafeAreaView>;
  }

  if (error || !announcement) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.title}>{announcement ? 'Unable to load announcement.' : 'Announcement not found.'}</Text>
        <Text style={styles.message}>{error || 'Return to the announcements list and choose another announcement.'}</Text>
        <Pressable accessibilityRole="button" onPress={announcement ? loadAnnouncement : navigation.goBack} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <Text style={styles.buttonText}>{announcement ? 'Retry' : 'Go Back'}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.icon}><AppIcon color={colors.primary} name="bell" size={28} /></View>
        <Text style={styles.title}>{announcement.title || 'Untitled announcement'}</Text>
        <Text style={styles.meta}>
          {club?.name || 'General announcement'}  •  {getAnnouncementDateTime(announcement.createdAt)}
        </Text>
        <View style={styles.card}>
          <Text style={styles.messageBody}>{announcement.message || 'No announcement details available.'}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  centered: { alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center', padding: spacing.xxl },
  icon: { ...componentStyles.mediaPlaceholder, alignSelf: 'center', height: 56, width: 56 },
  title: { color: colors.text, marginTop: spacing.lg, textAlign: 'center', ...typography.screenTitle },
  meta: { color: colors.secondaryText, marginTop: spacing.sm, textAlign: 'center', ...typography.caption },
  card: { ...componentStyles.card, marginTop: spacing.xl },
  messageBody: { color: colors.text, lineHeight: 24, ...typography.body },
  message: { color: colors.secondaryText, marginTop: spacing.sm, textAlign: 'center', ...typography.secondary },
  button: { ...componentStyles.primaryButton, marginTop: spacing.xl },
  buttonText: { color: colors.white, ...typography.label },
  pressed: componentStyles.pressed,
});
