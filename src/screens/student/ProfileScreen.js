import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppIcon from '../../components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import { getRegisteredEvents } from '../../repositories/eventRegistrationRepository';
import { getJoinedClubs } from '../../repositories/membershipRepository';
import { colors, componentStyles, radii, spacing, typography } from '../../theme';

const menuItems = [
  { icon: 'edit', label: 'Edit Profile' },
  { icon: 'clubs', label: 'My Clubs' },
  { icon: 'events', label: 'My Events' },
  { icon: 'clubs', label: 'Bookmarks' },
  { icon: 'bell', label: 'Notifications' },
  { icon: 'settings', label: 'Settings' },
];

function ProfileRow({ icon, label, onPress }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}>
      <View style={styles.menuIcon}>
        <AppIcon color={label === 'Logout' ? colors.dark : colors.secondaryText} name={icon} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export default function ProfileScreen({ navigation }) {
  const { logout, user, userProfile } = useAuth();
  const [registeredEventCount, setRegisteredEventCount] = useState(null);
  const [joinedClubCount, setJoinedClubCount] = useState(null);
  const displayName = userProfile?.fullName || user?.displayName || 'Student';
  const normalizedRole = userProfile?.role?.trim().toLowerCase();
  const role = normalizedRole === 'admin'
    ? 'Administrator'
    : normalizedRole === 'president'
      ? 'Club President'
      : 'Student';
  const dashboardItem = normalizedRole === 'admin'
    ? { icon: 'settings', label: 'Admin Dashboard', route: 'AdminDashboard' }
    : normalizedRole === 'president'
      ? { icon: 'clubs', label: 'President Dashboard', route: 'PresidentDashboard' }
      : null;

  useFocusEffect(useCallback(() => {
    let active = true;
    if (!user?.uid) {
      setRegisteredEventCount(null);
      setJoinedClubCount(null);
      return () => { active = false; };
    }

    Promise.all([getJoinedClubs(user.uid), getRegisteredEvents(user.uid)])
      .then(([clubs, events]) => {
        if (active) {
          setJoinedClubCount(clubs.length);
          setRegisteredEventCount(events.length);
        }
      }).catch(() => {
        if (active) {
          setJoinedClubCount(null);
          setRegisteredEventCount(null);
        }
      });

    return () => {
      active = false;
    };
  }, [user?.uid]));

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Profile</Text>

        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <AppIcon color={colors.secondaryText} name="user" size={42} />
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.role}>{role}</Text>
        </View>

        <Text style={styles.sectionTitle}>Your activity</Text>
        <View style={styles.statsCard}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{joinedClubCount ?? '—'}</Text>
            <Text style={styles.statLabel}>Clubs Joined</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{registeredEventCount ?? '—'}</Text>
            <Text style={styles.statLabel}>Events Registered</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Profile details</Text>
        <View style={styles.detailsList}>
          <ProfileDetail icon="user" label="Email" value={userProfile?.email || user?.email} />
          <ProfileDetail icon="user" label="Student ID" value={userProfile?.studentId} />
          <ProfileDetail icon="settings" label="Programme" value={userProfile?.programme} />
          <ProfileDetail icon="clubs" label="Department" value={userProfile?.department} />
          <ProfileDetail icon="events" label="Semester" value={userProfile?.semester} />
          <ProfileDetail icon="user" label="Phone" value={userProfile?.phone} />
        </View>

        <View style={styles.menuCard}>
          {dashboardItem ? (
            <ProfileRow
              icon={dashboardItem.icon}
              label={dashboardItem.label}
              onPress={() => navigation.navigate(dashboardItem.route)}
            />
          ) : null}
          {menuItems.map((item) => (
            <ProfileRow
              icon={item.icon}
              key={item.label}
              label={item.label}
              onPress={() => {
                const routeByLabel = {
                  'Edit Profile': 'EditProfile',
                  'My Clubs': 'MyClubs',
                  'My Events': 'MyEvents',
                  Bookmarks: 'Bookmarks',
                };
                const route = routeByLabel[item.label];
                if (route) {
                  navigation.navigate(route);
                }
              }}
            />
          ))}
          <ProfileRow icon="logout" label="Logout" onPress={logout} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileDetail({ icon, label, value }) {
  return (
    <View style={styles.detailRow}>
      <AppIcon color={colors.secondaryText} name={icon} size={18} />
      <View style={styles.detailText}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || 'Not provided'}</Text>
      </View>
    </View>
  );
}

function EmptyTabScreen({ title }) {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>This section is ready for the next feature.</Text>
    </SafeAreaView>
  );
}

export function EventsScreen() {
  return <EmptyTabScreen title="Events" />;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  title: {
    color: colors.text,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    ...typography.sectionHeading,
  },
  sectionTitle: {
    color: colors.text,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.lg,
    ...typography.cardTitle,
  },
  profileHeader: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
    paddingTop: spacing.xxl,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.chip,
    borderRadius: 56,
    height: 96,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 96,
  },
  avatarIcon: {
    color: colors.secondaryText,
    fontSize: 28,
  },
  name: {
    color: colors.text,
    ...typography.cardTitle,
  },
  role: {
    color: colors.secondaryText,
    marginTop: spacing.xs,
    ...typography.caption,
  },
  statsCard: {
    ...componentStyles.card,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
    marginHorizontal: spacing.lg,
    minHeight: 50,
    paddingVertical: spacing.sm,
  },
  detailsList: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  detailRow: {
    alignItems: 'flex-start',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  detailText: { flex: 1 },
  detailLabel: {
    color: colors.secondaryText,
    ...typography.caption,
  },
  detailValue: {
    color: colors.text,
    marginTop: spacing.xs,
    ...typography.secondary,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: colors.primary,
    fontWeight: '700',
    ...typography.body,
  },
  statLabel: {
    color: colors.secondaryText,
    ...typography.caption,
  },
  statDivider: {
    backgroundColor: colors.border,
    height: 28,
    width: 1,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    marginHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  menuRow: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  menuIcon: {
    color: colors.secondaryText,
    fontSize: 18,
    textAlign: 'center',
    width: 24,
  },
  menuLabel: {
    color: colors.text,
    flex: 1,
    marginLeft: spacing.sm,
    ...typography.secondary,
  },
  chevron: {
    color: colors.secondaryText,
    fontSize: 25,
    fontWeight: '300',
  },
  emptyContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  emptyTitle: {
    color: colors.text,
    ...typography.screenTitle,
  },
  emptyText: {
    color: colors.secondaryText,
    marginTop: spacing.sm,
    ...typography.secondary,
  },
  pressed: componentStyles.pressed,
});
