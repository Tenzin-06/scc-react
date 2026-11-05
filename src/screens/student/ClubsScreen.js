import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppIcon from '../../components/AppIcon';
import ClubCard from '../../components/ClubCard';
import { useAuth } from '../../contexts/AuthContext';
import { addBookmark, getUserBookmarks, removeBookmark } from '../../repositories/bookmarkRepository';
import { getAllClubs } from '../../repositories/clubRepository';
import { colors, componentStyles, radii, spacing, typography } from '../../theme';

function EmptyState({ onRetry, title, description }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function ClubsScreen({ navigation }) {
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [bookmarkLoadingId, setBookmarkLoadingId] = useState(null);

  const loadClubs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setClubs(await getAllClubs());
    } catch (loadError) {
      setError(loadError.message || 'Unable to load clubs.');
    } finally {
      setLoading(false);
    }

    try {
      const bookmarks = await getUserBookmarks(user.uid);
      setBookmarkedIds(new Set(bookmarks.filter((bookmark) => bookmark.itemType === 'club').map((bookmark) => bookmark.itemId)));
    } catch (bookmarkError) {
      Alert.alert('Bookmark status unavailable', bookmarkError.message || 'Please try again.');
    }
  }, [user?.uid]);

  async function toggleBookmark(clubId) {
    if (bookmarkLoadingId) return;
    setBookmarkLoadingId(clubId);
    try {
      if (bookmarkedIds.has(clubId)) {
        await removeBookmark(user.uid, clubId, 'club');
        setBookmarkedIds((current) => { const next = new Set(current); next.delete(clubId); return next; });
      } else {
        await addBookmark(user.uid, clubId, 'club');
        setBookmarkedIds((current) => new Set(current).add(clubId));
      }
    } catch (bookmarkError) {
      Alert.alert('Bookmark could not be updated', bookmarkError.message || 'Please try again.');
    } finally {
      setBookmarkLoadingId(null);
    }
  }

  useFocusEffect(useCallback(() => { loadClubs(); }, [loadClubs]));

  const categories = useMemo(() => {
    const values = clubs
      .map((club) => club.category?.trim())
      .filter(Boolean);
    return ['All', ...Array.from(new Set(values))];
  }, [clubs]);

  const filteredClubs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return clubs.filter((club) => {
      const matchesSearch = !query || club.name?.toLowerCase().includes(query);
      const matchesCategory =
        selectedCategory === 'All' || club.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [clubs, search, selectedCategory]);

  function clearFilters() {
    setSearch('');
    setSelectedCategory('All');
  }

  function renderHeader() {
    return (
      <>
        <Text style={styles.title}>Explore clubs</Text>
        <Text style={styles.description}>
          Find communities and activities that match your interests.
        </Text>
        <View style={styles.searchContainer}>
          <AppIcon color={colors.secondaryText} name="search" size={19} />
          <TextInput
            accessibilityLabel="Search clubs by name"
            onChangeText={setSearch}
            placeholder="Search clubs by name..."
            placeholderTextColor={colors.secondaryText}
            style={styles.searchInput}
            value={search}
          />
          {search ? (
            <Pressable accessibilityRole="button" onPress={() => setSearch('')} style={styles.clearButton}>
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
          ) : null}
        </View>
        <FlatList
          contentContainerStyle={styles.categories}
          data={categories}
          horizontal
          keyExtractor={(category) => category}
          renderItem={({ item: category }) => (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: selectedCategory === category }}
              onPress={() => setSelectedCategory(category)}
              style={({ pressed }) => [
                styles.categoryChip,
                selectedCategory === category && styles.selectedCategoryChip,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.selectedCategoryText,
                ]}
              >
                {category}
              </Text>
            </Pressable>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.statusText}>Loading clubs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {renderHeader()}
          <EmptyState
            description="Please check your connection and try again."
            onRetry={loadClubs}
            title="Unable to load clubs."
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        contentContainerStyle={styles.content}
        data={filteredClubs}
        keyExtractor={(club) => club.id}
        ListEmptyComponent={
          <EmptyState
            description={
              clubs.length
                ? 'Try a different search or category.'
                : 'Please check back later.'
            }
            onRetry={clubs.length ? clearFilters : loadClubs}
            title={clubs.length ? 'No clubs found.' : 'No clubs available yet.'}
          />
        }
        ListHeaderComponent={renderHeader}
        renderItem={({ item: club }) => (
          <ClubCard
            club={club}
            bookmarked={bookmarkedIds.has(club.id)}
            bookmarkLoading={bookmarkLoadingId === club.id}
            compact
            onBookmark={() => toggleBookmark(club.id)}
            onPress={() => navigation.navigate('ClubDetails', { clubId: club.id })}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  title: {
    color: colors.text,
    ...typography.screenTitle,
  },
  description: {
    color: colors.secondaryText,
    marginTop: spacing.xs,
    ...typography.secondary,
  },
  searchContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: spacing.xl,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    marginLeft: spacing.sm,
    paddingVertical: spacing.sm,
    ...typography.body,
  },
  clearText: {
    color: colors.primary,
    ...typography.caption,
  },
  clearButton: {
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.xs,
  },
  categories: {
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  categoryChip: {
    alignItems: 'center',
    backgroundColor: colors.chip,
    borderRadius: radii.pill,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.lg,
  },
  selectedCategoryChip: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    color: colors.text,
    ...typography.secondary,
  },
  selectedCategoryText: {
    color: colors.white,
    fontWeight: '600',
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  statusText: {
    color: colors.secondaryText,
    marginTop: spacing.md,
    ...typography.secondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxxl,
  },
  emptyTitle: {
    color: colors.text,
    textAlign: 'center',
    ...typography.sectionHeading,
  },
  emptyDescription: {
    color: colors.secondaryText,
    marginTop: spacing.sm,
    textAlign: 'center',
    ...typography.secondary,
  },
  retryButton: {
    ...componentStyles.primaryButton,
    marginTop: spacing.lg,
  },
  retryText: {
    color: colors.white,
    ...typography.label,
  },
  pressed: componentStyles.pressed,
});
