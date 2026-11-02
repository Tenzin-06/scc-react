import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import { db } from '../services/firebase';

function createProfileError(message, code = 'firestore/unknown') {
  const error = new Error(message);
  error.code = code;
  return error;
}

function validateUid(uid) {
  if (!uid?.trim()) {
    throw createProfileError('A Firebase user ID is required.', 'firestore/invalid-uid');
  }
}

function validateRequiredProfileData(profileData) {
  if (!profileData?.fullName?.trim()) {
    throw createProfileError('Please enter your full name.', 'firestore/missing-name');
  }

  if (!profileData?.studentId?.trim()) {
    throw createProfileError('Please enter your Student ID.', 'firestore/missing-student-id');
  }

  if (!profileData?.email?.trim()) {
    throw createProfileError('Please enter your email.', 'firestore/missing-email');
  }
}

function getProfileErrorMessage(error, operation) {
  switch (error?.code) {
    case 'permission-denied':
    case 'firestore/permission-denied':
      return 'You do not have permission to access this profile.';
    case 'unavailable':
    case 'firestore/unavailable':
      return 'Unable to reach the profile database. Please check your connection and try again.';
    case 'firestore/profile-exists':
      return 'A profile already exists for this account.';
    default:
      return operation === 'load'
        ? 'Unable to load profile. Please check your connection and try again.'
        : 'Unable to save your profile. Please try again.';
  }
}

export async function createUserProfile(uid, userData) {
  validateUid(uid);
  validateRequiredProfileData(userData);

  const profileRef = doc(db, 'users', uid);

  try {
    const existingProfile = await getDoc(profileRef);

    if (existingProfile.exists()) {
      throw createProfileError('A profile already exists for this account.', 'firestore/profile-exists');
    }

    await setDoc(profileRef, {
      uid,
      fullName: userData.fullName.trim(),
      studentId: userData.studentId.trim(),
      email: userData.email.trim(),
      programme: userData.programme?.trim() || '',
      department: userData.department?.trim() || '',
      semester: userData.semester?.trim() || '',
      phone: userData.phone?.trim() || '',
      role: 'student',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw createProfileError(getProfileErrorMessage(error, 'create'), error?.code);
  }
}

export async function getUserProfile(uid) {
  validateUid(uid);

  try {
    const snapshot = await getDoc(doc(db, 'users', uid));
    return snapshot.exists() ? snapshot.data() : null;
  } catch (error) {
    throw createProfileError(getProfileErrorMessage(error, 'load'), error?.code);
  }
}

export async function getAllUserProfiles() {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map((userSnapshot) => ({
      ...userSnapshot.data(),
      id: userSnapshot.id,
    }));
  } catch (error) {
    throw createProfileError(getProfileErrorMessage(error, 'load'), error?.code);
  }
}

export async function updateUserProfileAsAdmin(uid, updatedData) {
  validateUid(uid);

  const permittedFields = new Set([
    'fullName',
    'studentId',
    'email',
    'programme',
    'department',
    'semester',
    'phone',
  ]);
  const permittedUpdates = Object.entries(updatedData || {}).reduce(
    (updates, [field, value]) => {
      if (permittedFields.has(field) && value !== undefined) {
        updates[field] = typeof value === 'string' ? value.trim() : value;
      }
      return updates;
    },
    {},
  );

  if (Object.keys(permittedUpdates).length === 0) {
    throw createProfileError('No permitted profile changes were provided.', 'firestore/no-changes');
  }

  try {
    await updateDoc(doc(db, 'users', uid.trim()), {
      ...permittedUpdates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw createProfileError(getProfileErrorMessage(error, 'update'), error?.code);
  }
}

export async function updateUserProfile(uid, updatedData) {
  validateUid(uid);

  const protectedFields = new Set(['uid', 'role', 'createdAt', 'updatedAt']);
  const permittedUpdates = Object.entries(updatedData || {}).reduce(
    (updates, [field, value]) => {
      if (!protectedFields.has(field) && value !== undefined) {
        updates[field] = typeof value === 'string' ? value.trim() : value;
      }
      return updates;
    },
    {},
  );

  if (Object.keys(permittedUpdates).length === 0) {
    throw createProfileError('No profile changes were provided.', 'firestore/no-changes');
  }

  try {
    await updateDoc(doc(db, 'users', uid), {
      ...permittedUpdates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw createProfileError(
      error?.code === 'permission-denied'
        ? 'You do not have permission to update this profile.'
        : 'Unable to update your profile. Please try again.',
      error?.code,
    );
  }
}

export async function userProfileExists(uid) {
  validateUid(uid);

  try {
    const snapshot = await getDoc(doc(db, 'users', uid));
    return snapshot.exists();
  } catch (error) {
    throw createProfileError(getProfileErrorMessage(error, 'load'), error?.code);
  }
}
