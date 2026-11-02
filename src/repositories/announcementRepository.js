import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
} from 'firebase/firestore';

import { db } from '../services/firebase';

const announcementsCollection = collection(db, 'announcements');

function createAnnouncementError(message, code = 'firestore/announcement-unknown') {
  const error = new Error(message);
  error.code = code;
  return error;
}

function validateId(announcementId) {
  if (typeof announcementId !== 'string' || !announcementId.trim()) {
    throw createAnnouncementError(
      'An announcement ID is required.',
      'firestore/invalid-announcement-id',
    );
  }
}

function validateLimit(limitCount) {
  if (!Number.isInteger(limitCount) || limitCount < 1 || limitCount > 50) {
    throw createAnnouncementError(
      'The announcement limit must be between 1 and 50.',
      'firestore/invalid-announcement-limit',
    );
  }
}

function toAnnouncement(snapshot) {
  return {
    ...snapshot.data(),
    id: snapshot.id,
  };
}

function getErrorMessage(error, operation) {
  switch (error?.code) {
    case 'permission-denied':
    case 'firestore/permission-denied':
      return 'You do not have permission to access announcements.';
    case 'unavailable':
    case 'deadline-exceeded':
    case 'auth/network-request-failed':
    case 'firestore/unavailable':
      return 'Unable to load announcements. Please check your connection and try again.';
    default:
      return operation === 'read-one'
        ? 'Unable to load the announcement. Please check your connection and try again.'
        : 'Unable to load announcements. Please check your connection and try again.';
  }
}

export async function getAllAnnouncements() {
  try {
    const snapshot = await getDocs(query(announcementsCollection, orderBy('createdAt', 'desc')));
    return snapshot.docs.map(toAnnouncement);
  } catch (error) {
    throw createAnnouncementError(getErrorMessage(error, 'read-all'), error?.code);
  }
}

export async function getAnnouncementById(announcementId) {
  validateId(announcementId);

  try {
    const snapshot = await getDoc(doc(db, 'announcements', announcementId.trim()));
    return snapshot.exists() ? toAnnouncement(snapshot) : null;
  } catch (error) {
    throw createAnnouncementError(getErrorMessage(error, 'read-one'), error?.code);
  }
}

export async function getRecentAnnouncements(limitCount = 3) {
  validateLimit(limitCount);

  try {
    const snapshot = await getDocs(
      query(announcementsCollection, orderBy('createdAt', 'desc'), limit(limitCount)),
    );
    return snapshot.docs.map(toAnnouncement);
  } catch (error) {
    throw createAnnouncementError(getErrorMessage(error, 'read-recent'), error?.code);
  }
}

export async function getAnnouncementsByClub(clubId) {
  if (typeof clubId !== 'string' || !clubId.trim()) {
    throw createAnnouncementError('A club ID is required.', 'firestore/invalid-club-id');
  }

  try {
    const snapshot = await getDocs(
      query(announcementsCollection, orderBy('createdAt', 'desc')),
    );
    return snapshot.docs
      .map(toAnnouncement)
      .filter((announcement) => announcement.clubId === clubId.trim());
  } catch (error) {
    throw createAnnouncementError(getErrorMessage(error, 'read-all'), error?.code);
  }
}
