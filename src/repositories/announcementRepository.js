import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
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

function validateAnnouncementData(data = {}) {
  if (typeof data.title !== 'string' || !data.title.trim()) {
    throw createAnnouncementError('An announcement title is required.', 'firestore/missing-announcement-title');
  }
  if (typeof data.message !== 'string' || !data.message.trim()) {
    throw createAnnouncementError('Announcement details are required.', 'firestore/missing-announcement-message');
  }
  if (typeof data.clubId !== 'string' || !data.clubId.trim()) {
    throw createAnnouncementError('A club ID is required.', 'firestore/invalid-club-id');
  }
}

export async function createAnnouncement(data = {}) {
  validateAnnouncementData(data);
  try {
    const snapshot = await addDoc(announcementsCollection, {
      title: data.title.trim(),
      message: data.message.trim(),
      clubId: data.clubId.trim(),
      createdBy: data.createdBy?.trim() || null,
      createdAt: serverTimestamp(),
    });
    return {
      id: snapshot.id,
      title: data.title.trim(),
      message: data.message.trim(),
      clubId: data.clubId.trim(),
    };
  } catch (error) {
    throw createAnnouncementError(getErrorMessage(error, 'create'), error?.code);
  }
}

export async function updateAnnouncement(announcementId, data = {}) {
  validateId(announcementId);
  const updates = {};
  if (data.title !== undefined) {
    if (typeof data.title !== 'string' || !data.title.trim()) {
      throw createAnnouncementError('An announcement title is required.', 'firestore/missing-announcement-title');
    }
    updates.title = data.title.trim();
  }
  if (data.message !== undefined) {
    if (typeof data.message !== 'string' || !data.message.trim()) {
      throw createAnnouncementError('Announcement details are required.', 'firestore/missing-announcement-message');
    }
    updates.message = data.message.trim();
  }
  if (!Object.keys(updates).length) {
    throw createAnnouncementError('No announcement changes were provided.', 'firestore/no-announcement-changes');
  }
  try {
    const ref = doc(db, 'announcements', announcementId.trim());
    if (!(await getDoc(ref)).exists()) {
      throw createAnnouncementError('The requested announcement could not be found.', 'firestore/announcement-not-found');
    }
    await updateDoc(ref, updates);
    return { id: announcementId.trim(), ...updates };
  } catch (error) {
    throw createAnnouncementError(getErrorMessage(error, 'update'), error?.code);
  }
}

export async function deleteAnnouncement(announcementId) {
  validateId(announcementId);
  try {
    const ref = doc(db, 'announcements', announcementId.trim());
    if (!(await getDoc(ref)).exists()) {
      throw createAnnouncementError('The requested announcement could not be found.', 'firestore/announcement-not-found');
    }
    await deleteDoc(ref);
    return { id: announcementId.trim(), deleted: true };
  } catch (error) {
    throw createAnnouncementError(getErrorMessage(error, 'delete'), error?.code);
  }
}
