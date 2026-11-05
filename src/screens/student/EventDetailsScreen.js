import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppIcon from '../../components/AppIcon';
import BookmarkButton from '../../components/BookmarkButton';
import AnnouncementCard from '../../components/AnnouncementCard';
import StickyActionBar from '../../components/StickyActionBar';
import { useAuth } from '../../contexts/AuthContext';
import useBookmark from '../../hooks/useBookmark';
import { getClubById } from '../../repositories/clubRepository';
import { getAllEvents, getEventById } from '../../repositories/eventRepository';
import { getAnnouncementsByClub } from '../../repositories/announcementRepository';
import { getClubMembers } from '../../repositories/membershipRepository';
import { isUpcomingEvent, sortEventsByDate } from '../../utils/eventDate';
import {
  cancelEventRegistration,
  checkEventRegistration,
  registerForEvent,
} from '../../repositories/eventRegistrationRepository';
import { colors, componentStyles, spacing, typography } from '../../theme';

export default function EventDetailsScreen({ navigation, route }) {
  const { user, userProfile, role } = useAuth();
  const eventId = route?.params?.eventId;
  const bookmark = useBookmark(user?.uid, eventId, 'event');
  const [event, setEvent] = useState(null);
  const [club, setClub] = useState(null);
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState('About');
  const [clubEvents, setClubEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [members, setMembers] = useState([]);

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
      if (nextEvent.clubId) {
        const canViewMembers = role === 'admin' || (role === 'president' && userProfile?.presidentOf === nextEvent.clubId);
        const [allEvents, nextAnnouncements, nextMembers] = await Promise.all([
          getAllEvents().catch(() => []),
          getAnnouncementsByClub(nextEvent.clubId).catch(() => []),
          canViewMembers ? getClubMembers(nextEvent.clubId).catch(() => []) : Promise.resolve([]),
        ]);
        setClubEvents(sortEventsByDate(allEvents.filter((item) => item.clubId === nextEvent.clubId && item.id !== nextEvent.id && isUpcomingEvent(item))));
        setAnnouncements(nextAnnouncements);
        setMembers(nextMembers);
      }
    } catch (loadError) {
      setError(loadError.message || 'Unable to load event details. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [eventId, role, user?.uid, userProfile?.presidentOf]);

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
        <Pressable accessibilityRole="button" onPress={event ? loadDetails : navigation.goBack} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <Text style={styles.buttonText}>{event ? 'Retry' : 'Go Back'}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} style={styles.scroll}>
        <Text style={styles.title}>{event.title}</Text>
        <View style={styles.infoCard}>
          <InfoRow icon="events" text={event.date || 'Date not provided'} />
          <InfoRow icon="events" text={event.time || 'Time not provided'} />
          <InfoRow icon="clubs" text={event.location || 'Location not provided'} />
          <InfoRow icon="user" text={`Organized by ${club?.name || 'SCC'}`} last />
        </View>
        <View style={styles.bookmarkRow}>
          <Text style={styles.bookmarkLabel}>{bookmark.bookmarked ? 'Saved to bookmarks' : 'Save this event'}</Text>
          <BookmarkButton bookmarked={bookmark.bookmarked} disabled={bookmark.loading} label="event" onPress={bookmark.toggle} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {['Upcoming Events', 'Announcements', 'About', ...(role === 'admin' || (role === 'president' && userProfile?.presidentOf === event.clubId) ? ['Club Members'] : [])].map((item) => (
            <Pressable accessibilityRole="tab" accessibilityState={{ selected: tab === item }} key={item} onPress={() => setTab(item)} style={[styles.tab, tab === item && styles.activeTab]}>
              <Text style={[styles.tabText, tab === item && styles.activeTabText]}>{item}</Text>
            </Pressable>
          ))}
        </ScrollView>
        {tab === 'About' ? <View style={styles.sectionCard}><Text style={styles.sectionTitle}>About This Event</Text><Text style={styles.description}>{event.description || 'No description available.'}</Text></View> : null}
        {tab === 'Upcoming Events' ? <View>{clubEvents.length ? clubEvents.map((item) => <Pressable key={item.id} onPress={() => navigation.push('EventDetails', { eventId: item.id })} style={styles.relatedCard}><Text style={styles.relatedTitle}>{item.title}</Text><Text style={styles.relatedMeta}>{item.date} · {item.time}</Text><Text style={styles.relatedMeta}>{item.location}</Text></Pressable>) : <Text style={styles.empty}>No other events for this club yet.</Text>}</View> : null}
        {tab === 'Announcements' ? <View>{announcements.length ? announcements.map((item) => <AnnouncementCard announcement={item} key={item.id} />) : <Text style={styles.empty}>No announcements for this club yet.</Text>}</View> : null}
        {tab === 'Club Members' ? <View>{members.length ? members.map((item) => <View key={item.userId} style={styles.memberRow}><AppIcon color={colors.secondaryText} name="user" /><Text style={styles.relatedTitle}>{item.displayName || 'Club member'}</Text></View>) : <Text style={styles.empty}>No club members to show.</Text>}</View> : null}
        <View style={styles.registeredCard}><Text style={styles.sectionTitle}>Registered Students</Text><Text style={styles.description}>{Number.isInteger(event.registrationCount) ? `${event.registrationCount} registered` : registered ? 'You are registered for this event.' : 'Register to reserve your place.'}</Text></View>
      </ScrollView>
      <StickyActionBar
        disabled={actionLoading}
        loading={actionLoading}
        message={message}
        onPress={handleRegistration}
        title={registered ? 'Cancel Registration' : 'Register'}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  centered: { alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center', padding: spacing.xxl },
  title: { color: colors.text, marginBottom: spacing.md, marginTop: spacing.sm, textAlign: 'center', ...typography.screenTitle },
  bookmarkRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  bookmarkLabel: { color: colors.secondaryText, ...typography.secondary },
  infoCard: { ...componentStyles.card, marginTop: spacing.sm, paddingVertical: spacing.xs },
  infoRow: { alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.sm },
  lastInfoRow: { borderBottomWidth: 0 },
  infoValue: { color: colors.text, flex: 1, ...typography.secondary },
  tabs: { gap: spacing.xs, paddingVertical: spacing.lg },
  tab: { borderColor: colors.border, borderRadius: 20, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  activeTab: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { color: colors.secondaryText, ...typography.caption },
  activeTabText: { color: colors.white },
  sectionCard: { ...componentStyles.card },
  sectionTitle: { color: colors.text, ...typography.cardTitle },
  description: { color: colors.secondaryText, marginTop: spacing.sm, ...typography.caption },
  relatedCard: { ...componentStyles.card, marginBottom: spacing.sm },
  relatedTitle: { color: colors.text, ...typography.cardTitle },
  relatedMeta: { color: colors.secondaryText, marginTop: spacing.xs, ...typography.caption },
  memberRow: { ...componentStyles.card, alignItems: 'center', flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xs },
  empty: { color: colors.secondaryText, paddingVertical: spacing.lg, textAlign: 'center', ...typography.secondary },
  registeredCard: { ...componentStyles.card, marginTop: spacing.lg },
  button: { ...componentStyles.primaryButton, marginTop: spacing.xl },
  buttonText: { color: colors.white, ...typography.label },
  pressed: componentStyles.pressed,
});

function InfoRow({ icon, text, last }) {
  return <View style={[styles.infoRow, last && styles.lastInfoRow]}><AppIcon color={colors.secondaryText} name={icon} size={17} /><Text style={styles.infoValue}>{text}</Text></View>;
}
