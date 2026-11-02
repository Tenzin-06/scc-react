import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppIcon from '../../components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import { colors, radii, spacing, typography } from '../../theme';

const menuItems = [
  { icon: 'edit', label: 'Edit Profile' },
  { icon: 'clubs', label: 'My Clubs' },
  { icon: 'events', label: 'My Events' },
  { icon: 'bell', label: 'Notifications' },
  { icon: 'settings', label: 'Settings' },
];

function ProfileRow({ icon, label, onPress }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.menuRow}>
      <View style={styles.menuIcon}>
        <AppIcon color={label === 'Logout' ? '#D91C2B' : colors.secondaryText} name={icon} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export default function ProfileScreen({ navigation }) {
  const { logout, user, userProfile } = useAuth();
  const displayName = userProfile?.fullName || user?.displayName || 'Student';
  const role = userProfile?.role === 'admin' ? 'Administrator' : 'Student';

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Profile</Text>

        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <AppIcon color={colors.secondaryText} name="user" size={27} />
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.role}>{role}</Text>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Clubs Joined</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Events Registered</Text>
          </View>
        </View>

        <View style={styles.menuCard}>
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
  profileHeader: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
    paddingTop: spacing.xxl,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#E8EBEF',
    borderRadius: 40,
    height: 56,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 56,
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
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
    marginHorizontal: spacing.lg,
    minHeight: 50,
    paddingVertical: spacing.sm,
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
    backgroundColor: '#E4E7EB',
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
    color: '#B8BEC6',
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
});
