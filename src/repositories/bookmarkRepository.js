import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';

import { auth, db } from '../services/firebase';
import { getClubById } from './clubRepository';
import { getEventById } from './eventRepository';

const bookmarksCollection = collection(db, 'bookmarks');
const itemRepositories = { club: getClubById, event: getEventById };

function validate(userId, itemId, itemType) {
  if (typeof userId !== 'string' || !userId.trim()) throw new Error('You must be signed in to manage bookmarks.');
  if (typeof itemId !== 'string' || !itemId.trim() || itemId.includes('/')) throw new Error('A valid item ID is required.');
  if (!Object.prototype.hasOwnProperty.call(itemRepositories, itemType)) throw new Error('Bookmark type must be club or event.');
  if (auth.currentUser?.uid !== userId.trim()) throw new Error('You can only manage your own bookmarks.');
}

function bookmarkId(userId, itemType, itemId) {
  return `${userId.trim()}_${itemType}_${itemId.trim()}`;
}

export async function addBookmark(userId, itemId, itemType) {
  validate(userId, itemId, itemType);
  const item = await itemRepositories[itemType](itemId.trim());
  if (!item) throw new Error(`This ${itemType} no longer exists.`);

  const id = bookmarkId(userId, itemType, itemId);
  const ref = doc(db, 'bookmarks', id);
  const created = await runTransaction(db, async (transaction) => {
    const existing = await transaction.get(ref);
    if (existing.exists()) return false;
    transaction.set(ref, {
      userId: userId.trim(),
      itemId: itemId.trim(),
      itemType,
      createdAt: serverTimestamp(),
    });
    return true;
  });
  return { created, alreadyExisted: !created, id };
}

export async function removeBookmark(userId, itemId, itemType) {
  validate(userId, itemId, itemType);
  const ref = doc(db, 'bookmarks', bookmarkId(userId, itemType, itemId));
  const existing = await getDoc(ref);
  if (!existing.exists()) return { removed: false, missing: true };
  if (existing.data().userId !== userId.trim()) throw new Error('You can only remove your own bookmarks.');
  await deleteDoc(ref);
  return { removed: true, missing: false };
}

export async function checkBookmark(userId, itemId, itemType) {
  validate(userId, itemId, itemType);
  const snapshot = await getDoc(doc(db, 'bookmarks', bookmarkId(userId, itemType, itemId)));
  return snapshot.exists() && snapshot.data().userId === userId.trim();
}

async function getBookmarkedItems(userId, itemType) {
  if (typeof userId !== 'string' || !userId.trim()) throw new Error('You must be signed in to view bookmarks.');
  if (auth.currentUser?.uid !== userId.trim()) throw new Error('You can only view your own bookmarks.');
  const snapshot = await getDocs(query(bookmarksCollection, where('userId', '==', userId.trim()), where('itemType', '==', itemType)));
  const itemIds = [...new Set(snapshot.docs.map((bookmark) => bookmark.data().itemId).filter((id) => typeof id === 'string' && id))];
  const getItem = itemRepositories[itemType];
  const items = await Promise.all(itemIds.map((id) => getItem(id)));
  return items.filter(Boolean);
}

export function getBookmarkedClubs(userId) {
  return getBookmarkedItems(userId, 'club');
}

export function getBookmarkedEvents(userId) {
  return getBookmarkedItems(userId, 'event');
}

export async function getUserBookmarks(userId) {
  if (typeof userId !== 'string' || !userId.trim()) throw new Error('You must be signed in to view bookmarks.');
  if (auth.currentUser?.uid !== userId.trim()) throw new Error('You can only view your own bookmarks.');
  const snapshot = await getDocs(query(bookmarksCollection, where('userId', '==', userId.trim())));
  return snapshot.docs.map((bookmark) => ({ id: bookmark.id, ...bookmark.data() }));
}
