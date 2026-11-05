import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { addBookmark, checkBookmark, removeBookmark } from '../repositories/bookmarkRepository';

export default function useBookmark(userId, itemId, itemType) {
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId || !itemId) {
      setBookmarked(false);
      setStatusLoading(false);
      return;
    }
    setStatusLoading(true);
    try {
      setBookmarked(await checkBookmark(userId, itemId, itemType));
    } catch (error) {
      Alert.alert('Bookmark status unavailable', error.message || 'Please try again.');
    } finally {
      setStatusLoading(false);
    }
  }, [itemId, itemType, userId]);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const toggle = useCallback(async () => {
    if (!userId || !itemId || loading) return false;
    setLoading(true);
    try {
      if (bookmarked) await removeBookmark(userId, itemId, itemType);
      else await addBookmark(userId, itemId, itemType);
      setBookmarked(!bookmarked);
      return true;
    } catch (error) {
      Alert.alert('Bookmark could not be updated', error.message || 'Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [bookmarked, itemId, itemType, loading, userId]);

  return { bookmarked, loading: loading || statusLoading, refresh, toggle };
}
