import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AppIcon from '../components/AppIcon';
import ClubsScreen from '../screens/student/ClubsScreen';
import ClubDetailsScreen from '../screens/student/ClubDetailsScreen';
import HomeScreen from '../screens/student/HomeScreen';
import MyClubsScreen from '../screens/student/MyClubsScreen';
import MyEventsScreen from '../screens/student/MyEventsScreen';
import BookmarksScreen from '../screens/student/BookmarksScreen';
import EventDetailsScreen from '../screens/student/EventDetailsScreen';
import EventsScreen from '../screens/student/EventsScreen';
import AnnouncementsScreen from '../screens/student/AnnouncementsScreen';
import AnnouncementDetailsScreen from '../screens/student/AnnouncementDetailsScreen';
import ProfileScreen from '../screens/student/ProfileScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import ManageAnnouncementsScreen from '../screens/admin/ManageAnnouncementsScreen';
import ManageClubsScreen from '../screens/admin/ManageClubsScreen';
import ManageEventsScreen from '../screens/admin/ManageEventsScreen';
import ManagePresidentsScreen from '../screens/admin/ManagePresidentsScreen';
import ManageUsersScreen from '../screens/admin/ManageUsersScreen';
import PresidentDashboardScreen from '../screens/president/PresidentDashboardScreen';
import ManageClubScreen from '../screens/president/ManageClubScreen';
import ManageMembersScreen from '../screens/president/ManageMembersScreen';
import PresidentEventsScreen from '../screens/president/ManageEventsScreen';
import PresidentAnnouncementsScreen from '../screens/president/ManageAnnouncementsScreen';
import AddClubScreen from '../screens/admin/AddClubScreen';
import AddEventScreen from '../screens/admin/AddEventScreen';
import AddAnnouncementScreen from '../screens/admin/AddAnnouncementScreen';
import { colors, typography } from '../theme';
import PlaceholderScreen from './PlaceholderScreen';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const tabOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.secondaryText,
  tabBarLabelStyle: typography.caption,
  tabBarStyle: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    elevation: 0,
    minHeight: 62,
    paddingTop: 4,
  },
};

function StudentTabs() {
  return (
    <Tabs.Navigator initialRouteName="Home" screenOptions={tabOptions}>
      <Tabs.Screen
        component={HomeScreen}
        name="Home"
        options={{ tabBarIcon: ({ color }) => <AppIcon color={color} name="home" size={21} /> }}
      />
      <Tabs.Screen
        component={ClubsScreen}
        name="Clubs"
        options={{ tabBarIcon: ({ color }) => <AppIcon color={color} name="clubs" size={21} /> }}
      />
      <Tabs.Screen
        component={EventsScreen}
        name="Events"
        options={{ tabBarIcon: ({ color }) => <AppIcon color={color} name="events" size={21} /> }}
      />
      <Tabs.Screen
        component={ProfileScreen}
        name="Profile"
        options={{ tabBarIcon: ({ color }) => <AppIcon color={color} name="profile" size={21} /> }}
      />
    </Tabs.Navigator>
  );
}

export default function StudentNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="StudentTabs"
      screenOptions={{
        headerBackTitle: 'Back',
        headerTintColor: colors.primary,
        headerTitleStyle: typography.cardTitle,
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: colors.surface },
      }}
    >
      <Stack.Screen component={StudentTabs} name="StudentTabs" options={{ headerShown: false }} />
      <Stack.Screen component={ClubDetailsScreen} name="ClubDetails" options={{ title: 'Club Details' }} />
      <Stack.Screen component={EventDetailsScreen} name="EventDetails" options={{ title: 'Event Details' }} />
      <Stack.Screen component={MyClubsScreen} name="MyClubs" options={{ title: 'My Clubs' }} />
      <Stack.Screen component={MyEventsScreen} name="MyEvents" options={{ title: 'My Events' }} />
      <Stack.Screen component={BookmarksScreen} name="Bookmarks" options={{ title: 'Bookmarks' }} />
      <Stack.Screen component={AnnouncementsScreen} name="Announcements" options={{ title: 'Announcements' }} />
      <Stack.Screen component={AnnouncementDetailsScreen} name="AnnouncementDetails" options={{ title: 'Announcement' }} />
      <Stack.Screen component={PlaceholderScreen} name="EditProfile" />
      <Stack.Screen component={AdminDashboardScreen} name="AdminDashboard" options={{ title: 'Admin Dashboard' }} />
      <Stack.Screen component={ManageUsersScreen} name="ManageUsers" options={{ title: 'Manage Users' }} />
      <Stack.Screen component={ManageClubsScreen} name="ManageClubs" options={{ title: 'Manage Clubs' }} />
      <Stack.Screen component={ManageEventsScreen} name="ManageEvents" options={{ title: 'Manage Events' }} />
      <Stack.Screen component={ManageAnnouncementsScreen} name="ManageAnnouncements" options={{ title: 'Manage Announcements' }} />
      <Stack.Screen component={ManagePresidentsScreen} name="ManagePresidents" options={{ title: 'Manage Presidents' }} />
      <Stack.Screen component={PresidentDashboardScreen} name="PresidentDashboard" options={{ title: 'President Dashboard' }} />
      <Stack.Screen component={ManageClubScreen} name="ManageClub" options={{ title: 'Manage Club' }} />
      <Stack.Screen component={ManageMembersScreen} name="ManageMembers" options={{ title: 'Manage Members' }} />
      <Stack.Screen component={PresidentEventsScreen} name="PresidentEvents" options={{ title: 'Manage Events' }} />
      <Stack.Screen component={PresidentAnnouncementsScreen} name="PresidentAnnouncements" options={{ title: 'Manage Announcements' }} />
      <Stack.Screen component={AddClubScreen} name="AddClub" options={{ title: 'Add Club' }} />
      <Stack.Screen component={AddClubScreen} name="EditClub" options={{ title: 'Edit Club' }} />
      <Stack.Screen component={AddEventScreen} name="AddEvent" options={{ title: 'Add Event' }} />
      <Stack.Screen component={AddEventScreen} name="EditEvent" options={{ title: 'Edit Event' }} />
      <Stack.Screen component={AddAnnouncementScreen} name="AddAnnouncement" options={{ title: 'Add Announcement' }} />
      <Stack.Screen component={AddAnnouncementScreen} name="EditAnnouncement" options={{ title: 'Edit Announcement' }} />
    </Stack.Navigator>
  );
}
