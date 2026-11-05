import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppIcon from '../../components/AppIcon';
import BookmarkButton from '../../components/BookmarkButton';
import { useAuth } from '../../contexts/AuthContext';
import useBookmark from '../../hooks/useBookmark';
import { getClubById } from '../../repositories/clubRepository';
import { getEventById } from '../../repositories/eventRepository';
import {
  cancelEventRegistration,
  checkEventRegistration,
  registerForEvent,
} from '../../repositories/eventRegistrationRepository';
import { colors, radii, spacing, typography } from '../../theme';

export default function EventDetailsScreen({ navigation, route }) {
  const { user } = useAuth();
  const eventId = route?.params?.eventId;
  const bookmark = useBookmark(user?.uid, eventId, 'event');
  const [event, setEvent] = useState(null);
  const [club, setClub] = useState(null);
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadDetails = useCallback(async () => {
    if (!eventId || !user?.uid) {
      setError('This event could not be opened.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const nextEvent = await getEventById(eventId);
      if (!nextEvent) {
        setEvent(null);
        return;
      }
      setEvent(nextEvent);
      setClub(nextEvent.clubId ? await getClubById(nextEvent.clubId).catch(() => null) : null);
      setRegistered(await checkEventRegistration(user.uid, eventId));
    } catch (loadError) {
      setError(loadError.message || 'Unable to load event details. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [eventId, user?.uid]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  async function handleRegistration() {
    if (registered) {
      Alert.alert(
        'Cancel Registration?',
        'Are you sure you want to cancel your registration for this event?',
        [
          { text: 'Keep Registration', style: 'cancel' },
          { text: 'Cancel Registration', style: 'destructive', onPress: cancelRegistration },
        ],
      );
      return;
    }

    setActionLoading(true);
    setMessage('');
    try {
      await registerForEvent(user.uid, eventId);
      setRegistered(true);
      setMessage('You have successfully registered for this event.');
    } catch (registrationError) {
      setMessage(registrationError.message || 'Something went wrong. Please try again.');
    } finally {
      setActionLoading(false);
    }
  }

  async function cancelRegistration() {
    setActionLoading(true);
    setMessage('');
    try {
      await cancelEventRegistration(user.uid, eventId);
      setRegistered(false);
      setMessage('Your event registration has been cancelled.');
    } catch (registrationError) {
      setMessage(registrationError.message || 'Something went wrong. Please try again.');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return <SafeAreaView style={styles.centered}><ActivityIndicator color={colors.primary} size="large" /></SafeAreaView>;
  }

  if (error || !event) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.title}>{event ? 'Unable to load event details.' : 'Event not found.'}</Text>
        <Text style={styles.message}>{error || 'Return to the Events screen and choose another event.'}</Text>
        <Pressable onPress={event ? loadDetails : navigation.goBack} style={styles.button}>
          <Text style={styles.buttonText}>{event ? 'Retry' : 'Go Back'}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {event.imageUrl ? <Image source={{ uri: event.imageUrl }} style={styles.image} /> : (
          <View style={styles.imagePlaceholder}><AppIcon color={colors.primary} name="events" size={42} /></View>
        )}
        <Text style={styles.title}>{event.title}</Text>
        <View style={styles.bookmarkRow}>
          <Text style={styles.bookmarkLabel}>{bookmark.bookmarked ? 'Saved to bookmarks' : 'Save this event'}</Text>
          <BookmarkButton bookmarked={bookmark.bookmarked} disabled={bookmark.loading} label="event" onPress={bookmark.toggle} />
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Date</Text><Text style={styles.infoValue}>{event.date || 'Date not provided'}</Text>
          <Text style={styles.infoLabel}>Time</Text><Text style={styles.infoValue}>{event.time || 'Time not provided'}</Text>
          <Text style={styles.infoLabel}>Location</Text><Text style={styles.infoValue}>{event.location || 'Location not provided'}</Text>
          <Text style={styles.infoLabel}>Club</Text><Text style={styles.infoValue}>{club?.name || 'Club information unavailable'}</Text>
        </View>
        <Text style={styles.sectionTitle}>About this event</Text>
        <Text style={styles.description}>{event.description || 'No description available.'}</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <Pressable disabled={actionLoading} onPress={handleRegistration} style={[styles.button, actionLoading && styles.disabled]}>
          {actionLoading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>{registered ? 'Cancel Registration' : 'Register for Event'}</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  centered: { alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center', padding: spacing.xxl },
  image: { borderRadius: radii.card, height: 190, width: '100%' },
  imagePlaceholder: { alignItems: 'center', backgroundColor: '#E8EEF7', borderRadius: radii.card, height: 190, justifyContent: 'center' },
  title: { color: colors.text, marginTop: spacing.lg, textAlign: 'center', ...typography.screenTitle },
  bookmarkRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  bookmarkLabel: { color: colors.secondaryText, ...typography.secondary },
  infoCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.card, borderWidth: 1, marginTop: spacing.xl, padding: spacing.lg },
  infoLabel: { color: colors.secondaryText, marginTop: spacing.sm, ...typography.caption },
  infoValue: { color: colors.text, marginTop: spacing.xs, ...typography.body },
  sectionTitle: { color: colors.text, marginTop: spacing.xxl, ...typography.sectionHeading },
  description: { color: colors.secondaryText, marginTop: spacing.sm, ...typography.body },
  message: { color: colors.primary, marginTop: spacing.lg, textAlign: 'center', ...typography.secondary },
  button: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: radii.md, justifyContent: 'center', marginTop: spacing.xl, minHeight: 50, paddingHorizontal: spacing.lg },
  disabled: { opacity: 0.6 },
  buttonText: { color: colors.white, fontWeight: '600' },
});
