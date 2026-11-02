import {
  collection,
  collectionGroup,
  getCountFromServer,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

import { db } from '../services/firebase';
import { getAllUserProfiles } from './userRepository';

function createAdminError(message, code = 'firestore/admin-unknown') {
  const error = new Error(message);
  error.code = code;
  return error;
}

async function count(collectionReference, constraints = []) {
  const target = constraints.length
    ? query(collectionReference, ...constraints)
    : collectionReference;
  const snapshot = await getCountFromServer(target);
  return snapshot.data().count;
}

export async function getAdminDashboardStats() {
  try {
    const [students, presidents, clubs, events, memberships, announcements] = await Promise.all([
      count(collection(db, 'users'), [where('role', '==', 'student')]),
      count(collection(db, 'users'), [where('role', '==', 'president')]),
      count(collection(db, 'clubs')),
      count(collection(db, 'events')),
      count(collectionGroup(db, 'members')),
      count(collection(db, 'announcements')),
    ]);

    return { students, presidents, clubs, events, memberships, announcements };
  } catch (error) {
    throw createAdminError(
      error?.code === 'permission-denied'
        ? 'You do not have permission to load administrator statistics.'
        : 'Unable to load administrator statistics. Please try again.',
      error?.code,
    );
  }
}

export async function getAdminUsers() {
  return getAllUserProfiles();
}

export async function getAdminEvents() {
  try {
    const snapshot = await getDocs(collection(db, 'events'));
    return snapshot.docs.map((item) => ({ ...item.data(), id: item.id }));
  } catch (error) {
    throw createAdminError('Unable to load events. Please try again.', error?.code);
  }
}
