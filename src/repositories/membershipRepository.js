import {
  deleteDoc,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '../services/firebase';
import { getClubById } from './clubRepository';

function createMembershipError(message, code = 'firestore/membership-unknown') {
  const error = new Error(message);
  error.code = code;
  return error;
}

function validateId(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    throw createMembershipError(`A ${label} is required.`, `firestore/invalid-${label}`);
  }
}

function membershipRef(clubId, userId) {
  return doc(db, 'clubs', clubId.trim(), 'members', userId.trim());
}

function getMembershipErrorMessage(error, operation) {
  switch (error?.code) {
    case 'permission-denied':
    case 'firestore/permission-denied':
      return 'You do not have permission to change this membership.';
    case 'unavailable':
    case 'firestore/unavailable':
      return 'Unable to reach the membership database. Please try again.';
    case 'firestore/membership-exists':
      return 'You are already a member of this club.';
    case 'firestore/membership-not-found':
      return 'You are not a member of this club.';
    default:
      return operation === 'check'
        ? 'Unable to check membership status.'
        : operation === 'leave'
          ? 'Unable to leave this club. Please try again.'
          : 'Unable to join this club. Please try again.';
  }
}

export async function joinClub(clubId, userId) {
  validateId(clubId, 'club ID');
  validateId(userId, 'user ID');

  try {
    const club = await getClubById(clubId);
    if (!club) {
      throw createMembershipError('The requested club could not be found.', 'firestore/club-not-found');
    }

    const ref = membershipRef(clubId, userId);
    await runTransaction(db, async (transaction) => {
      const membership = await transaction.get(ref);
      if (membership.exists()) {
        throw createMembershipError('You are already a member of this club.', 'firestore/membership-exists');
      }

      transaction.set(ref, {
        userId: userId.trim(),
        joinedAt: serverTimestamp(),
        role: 'member',
      });
    });

    return { clubId: clubId.trim(), userId: userId.trim(), joined: true };
  } catch (error) {
    throw createMembershipError(getMembershipErrorMessage(error, 'join'), error?.code);
  }
}

export async function leaveClub(clubId, userId) {
  validateId(clubId, 'club ID');
  validateId(userId, 'user ID');

  try {
    const ref = membershipRef(clubId, userId);
    await runTransaction(db, async (transaction) => {
      const membership = await transaction.get(ref);
      if (!membership.exists()) {
        throw createMembershipError('You are not a member of this club.', 'firestore/membership-not-found');
      }

      transaction.delete(ref);
    });

    return { clubId: clubId.trim(), userId: userId.trim(), joined: false };
  } catch (error) {
    throw createMembershipError(getMembershipErrorMessage(error, 'leave'), error?.code);
  }
}

export async function checkMembership(clubId, userId) {
  validateId(clubId, 'club ID');
  validateId(userId, 'user ID');

  try {
    const snapshot = await getDoc(membershipRef(clubId, userId));
    return snapshot.exists();
  } catch (error) {
    throw createMembershipError(getMembershipErrorMessage(error, 'check'), error?.code);
  }
}

export async function getClubMemberCount(clubId) {
  validateId(clubId, 'club ID');

  try {
    const countSnapshot = await getCountFromServer(
      collection(db, 'clubs', clubId.trim(), 'members'),
    );
    return countSnapshot.data().count;
  } catch (error) {
    throw createMembershipError(getMembershipErrorMessage(error, 'check'), error?.code);
  }
}
