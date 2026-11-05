import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppIcon from '../../components/AppIcon';
import BookmarkButton from '../../components/BookmarkButton';
import StickyActionBar from '../../components/StickyActionBar';
import { useAuth } from '../../contexts/AuthContext';
import useBookmark from '../../hooks/useBookmark';
import { getClubById } from '../../repositories/clubRepository';
import {
  checkMembership,
  getClubMemberCount,
  joinClub,
  leaveClub,
} from '../../repositories/membershipRepository';
import { colors, componentStyles, radii, spacing, typography } from '../../theme';

export default function ClubDetailsScreen({ navigation, route }) {
  const { user } = useAuth();
  const clubId = route?.params?.clubId;
  const bookmark = useBookmark(user?.uid, clubId, 'club');
  const [club, setClub] = useState(null);
  const [president, setPresident] = useState(null);
  const [memberCount, setMemberCount] = useState(0);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadDetails = useCallback(async () => {
    if (!clubId || !user?.uid) {
      setError('This club could not be opened.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const nextClub = await getClubById(clubId);
      if (!nextClub) {
        setClub(null);
        return;
      }

      setClub(nextClub);
      setMemberCount(
        await getClubMemberCount(clubId).catch(() => nextClub.memberCount || 0),
      );
      setIsMember(await checkMembership(clubId, user.uid));
      setPresident(nextClub.presidentId ? { fullName: nextClub.presidentName || null } : null);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load club details.');
    } finally {
      setLoading(false);
    }
  }, [clubId, user?.uid]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  async function handleJoin() {
    setActionLoading(true);
    setMessage('');
    try {
      await joinClub(clubId, user.uid);
      setIsMember(true);
      setMemberCount(await getClubMemberCount(clubId).catch(() => memberCount));
      setMessage('You have successfully joined this club.');
    } catch (joinError) {
      setMessage(joinError.message || 'Unable to join this club. Please try again.');
    } finally {
      setActionLoading(false);
    }
  }

  function handleLeave() {
    Alert.alert('Leave Club?', 'Are you sure you want to leave this club?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          setMessage('');
          try {
            await leaveClub(clubId, user.uid);
            setIsMember(false);
            setMemberCount(await getClubMemberCount(clubId).catch(() => memberCount));
            setMessage('You have successfully left this club.');
          } catch (leaveError) {
            setMessage(leaveError.message || 'Unable to leave this club. Please try again.');
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (error || !club) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorTitle}>{club ? 'Unable to load club details.' : 'Club not found.'}</Text>
        <Text style={styles.errorText}>{error || 'Return to the Clubs screen and choose another club.'}</Text>
        <Pressable onPress={club ? loadDetails : navigation.goBack} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{club ? 'Retry' : 'Go Back'}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} style={styles.scroll}>
        {club.imageUrl ? (
          <Image source={{ uri: club.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <AppIcon color={colors.primary} name="clubs" size={42} />
          </View>
        )}
        <Text style={styles.title}>{club.name}</Text>
        <View style={styles.bookmarkRow}>
          <Text style={styles.bookmarkLabel}>{bookmark.bookmarked ? 'Saved to bookmarks' : 'Save this club'}</Text>
          <BookmarkButton bookmarked={bookmark.bookmarked} disabled={bookmark.loading} label="club" onPress={bookmark.toggle} />
        </View>
        <Text style={styles.category}>{club.category || 'General'}</Text>
        <Text style={styles.description}>{club.description || 'No description available.'}</Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>President</Text>
        <Text style={styles.infoValue}>{president?.fullName || (club.presidentId ? 'Assigned president' : 'President not assigned')}</Text>
          <Text style={styles.infoLabel}>Members</Text>
          <Text style={styles.infoValue}>{memberCount} Members</Text>
        </View>

        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        <View style={styles.eventCard}>
          <Text style={styles.eventTitle}>No upcoming events</Text>
          <Text style={styles.eventText}>Check back later for club events.</Text>
        </View>

      </ScrollView>
      <StickyActionBar
        disabled={actionLoading}
        loading={actionLoading}
        message={message}
        onPress={isMember ? handleLeave : handleJoin}
        title={isMember ? 'Leave Club' : 'Join Club'}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  centered: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  image: { borderRadius: radii.card, height: 190, width: '100%' },
  imagePlaceholder: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radii.card,
    height: 190,
    justifyContent: 'center',
  },
  title: { color: colors.text, marginTop: spacing.xl, ...typography.screenTitle },
  category: { color: colors.primary, marginTop: spacing.xs, ...typography.secondary },
  bookmarkRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  bookmarkLabel: { color: colors.secondaryText, ...typography.secondary },
  description: { color: colors.secondaryText, marginTop: spacing.md, ...typography.body },
  infoCard: {
    ...componentStyles.card,
    marginTop: spacing.xl,
  },
  infoLabel: { color: colors.secondaryText, marginTop: spacing.sm, ...typography.caption },
  infoValue: { color: colors.text, marginTop: spacing.xs, ...typography.body },
  sectionTitle: { color: colors.text, marginTop: spacing.xxl, ...typography.sectionHeading },
  eventCard: {
    ...componentStyles.card,
    marginTop: spacing.md,
  },
  eventTitle: { color: colors.text, ...typography.cardTitle },
  eventText: { color: colors.secondaryText, marginTop: spacing.xs, ...typography.caption },
  errorTitle: { color: colors.text, textAlign: 'center', ...typography.sectionHeading },
  errorText: { color: colors.secondaryText, marginTop: spacing.sm, textAlign: 'center', ...typography.secondary },
  primaryButton: { ...componentStyles.primaryButton, marginTop: spacing.xl },
  primaryButtonText: { color: colors.white, ...typography.label },
  pressed: componentStyles.pressed,
});
