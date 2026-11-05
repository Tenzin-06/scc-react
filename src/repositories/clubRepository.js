import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';

import { db } from '../services/firebase';

const clubsCollection = collection(db, 'clubs');
const editableFields = new Set(['name', 'description', 'category', 'presidentId', 'imageUrl']);

function createClubError(message, code = 'firestore/club-unknown') {
  const error = new Error(message);
  error.code = code;
  return error;
}

function validateClubId(clubId) {
  if (typeof clubId !== 'string' || !clubId.trim()) {
    throw createClubError('A club ID is required.', 'firestore/invalid-club-id');
  }
}

function validateClubName(name) {
  if (typeof name !== 'string' || !name.trim()) {
    throw createClubError('A club name is required.', 'firestore/missing-club-name');
  }
}

function normalizeOptionalText(value, fallback = null) {
  if (value === undefined || value === null) {
    return fallback;
  }

  return typeof value === 'string' ? value.trim() : value;
}

function toClub(snapshot) {
  return {
    ...snapshot.data(),
    id: snapshot.id,
  };
}

function getClubErrorMessage(error, operation) {
  switch (error?.code) {
    case 'permission-denied':
    case 'firestore/permission-denied':
      return 'You do not have permission to access clubs.';
    case 'unavailable':
    case 'firestore/unavailable':
      return 'Unable to reach the club database. Please check your connection and try again.';
    case 'firestore/club-not-found':
      return 'The requested club could not be found.';
    default:
      return operation === 'read'
        ? 'Unable to load clubs. Please check your connection and try again.'
        : operation === 'delete'
          ? 'Unable to delete the club. Please try again.'
          : 'Unable to save the club. Please try again.';
  }
}

export async function createClub(clubData = {}) {
  validateClubName(clubData.name);

  const club = {
    name: clubData.name.trim(),
    description: normalizeOptionalText(clubData.description, ''),
    category: normalizeOptionalText(clubData.category, ''),
    presidentId: normalizeOptionalText(clubData.presidentId),
    imageUrl: normalizeOptionalText(clubData.imageUrl),
    memberCount: 0,
    createdAt: serverTimestamp(),
  };

  try {
    const snapshot = await addDoc(clubsCollection, club);
    return {
      id: snapshot.id,
      ...club,
    };
  } catch (error) {
    throw createClubError(getClubErrorMessage(error, 'create'), error?.code);
  }
}

export async function getAllClubs() {
  try {
    const snapshot = await getDocs(clubsCollection);
    return snapshot.docs.map(toClub);
  } catch (error) {
    throw createClubError(getClubErrorMessage(error, 'read'), error?.code);
  }
}

export async function getClubById(clubId) {
  validateClubId(clubId);

  try {
    const snapshot = await getDoc(doc(db, 'clubs', clubId.trim()));
    return snapshot.exists() ? toClub(snapshot) : null;
  } catch (error) {
    throw createClubError(getClubErrorMessage(error, 'read'), error?.code);
  }
}

export async function updateClub(clubId, updatedData = {}) {
  validateClubId(clubId);

  const permittedUpdates = Object.entries(updatedData).reduce(
    (updates, [field, value]) => {
      if (!editableFields.has(field) || value === undefined) {
        return updates;
      }

      if (field === 'name') {
        validateClubName(value);
        updates[field] = value.trim();
      } else if (field === 'description' || field === 'category' || field === 'imageUrl') {
        updates[field] = normalizeOptionalText(value, '');
      } else {
        updates[field] = normalizeOptionalText(value);
      }

      return updates;
    },
    {},
  );

  if (Object.keys(permittedUpdates).length === 0) {
    throw createClubError('No permitted club changes were provided.', 'firestore/no-club-changes');
  }

  const clubRef = doc(db, 'clubs', clubId.trim());

  try {
    const existingClub = await getDoc(clubRef);
    if (!existingClub.exists()) {
      throw createClubError('The requested club could not be found.', 'firestore/club-not-found');
    }

    await updateDoc(clubRef, {
      ...permittedUpdates,
      updatedAt: serverTimestamp(),
    });

    return { id: clubId.trim(), ...permittedUpdates };
  } catch (error) {
    throw createClubError(getClubErrorMessage(error, 'update'), error?.code);
  }
}

export async function saveClubWithPresident(clubData = {}, clubId = null) {
  validateClubName(clubData.name);
  if (clubId) validateClubId(clubId);

  const existingClubRef = clubId ? doc(db, 'clubs', clubId.trim()) : null;
  const clubRef = existingClubRef || doc(clubsCollection);
  const selectedPresidentId = normalizeOptionalText(clubData.presidentId, null) || null;

  try {
    const existingSnapshot = existingClubRef ? await getDoc(existingClubRef) : null;
    if (existingSnapshot && !existingSnapshot.exists()) {
      throw createClubError('The requested club could not be found.', 'firestore/club-not-found');
    }

    const existingPresidentId = existingSnapshot?.data()?.presidentId || null;
    const selectedProfileRef = selectedPresidentId ? doc(db, 'users', selectedPresidentId) : null;
    const previousProfileRef = existingPresidentId && existingPresidentId !== selectedPresidentId
      ? doc(db, 'users', existingPresidentId)
      : null;
    const [selectedProfileSnapshot, previousProfileSnapshot] = await Promise.all([
      selectedProfileRef ? getDoc(selectedProfileRef) : Promise.resolve(null),
      previousProfileRef ? getDoc(previousProfileRef) : Promise.resolve(null),
    ]);

    const batch = writeBatch(db);
    const timestamp = serverTimestamp();
    const clubFields = {
      name: clubData.name.trim(),
      description: normalizeOptionalText(clubData.description, ''),
      category: normalizeOptionalText(clubData.category, ''),
      presidentId: selectedPresidentId,
      presidentName: selectedPresidentId ? selectedProfileSnapshot?.data()?.fullName || '' : '',
      imageUrl: normalizeOptionalText(clubData.imageUrl, ''),
    };

    if (selectedPresidentId) {
      if (!selectedProfileSnapshot?.exists()) {
        throw createClubError('The selected student profile could not be found.', 'firestore/invalid-president');
      }
      const selectedProfile = selectedProfileSnapshot.data();
      const selectedRole = typeof selectedProfile.role === 'string'
        ? selectedProfile.role.trim().toLowerCase()
        : '';
      if (selectedRole === 'student' && !selectedProfile.presidentOf) {
        batch.update(selectedProfileRef, {
          role: 'president',
          presidentOf: clubRef.id,
          updatedAt: timestamp,
        });
      } else if (selectedRole !== 'president' || selectedProfile.presidentOf !== clubRef.id) {
        throw createClubError('This student is already assigned to another role or club.', 'firestore/invalid-president');
      }
    }

    if (previousProfileRef) {
      if (!previousProfileSnapshot?.exists()) {
        throw createClubError('The current president profile could not be found.', 'firestore/invalid-president');
      }
      const previousProfile = previousProfileSnapshot.data();
      if (previousProfile.role !== 'president' || previousProfile.presidentOf !== clubRef.id) {
        throw createClubError('The current president assignment is inconsistent. Please contact support.', 'firestore/invalid-president');
      }
      batch.update(previousProfileRef, {
        role: 'student',
        presidentOf: null,
        updatedAt: timestamp,
      });
    }

    if (existingSnapshot) {
      batch.update(clubRef, { ...clubFields, updatedAt: timestamp });
    } else {
      batch.set(clubRef, { ...clubFields, memberCount: 0, createdAt: timestamp });
    }

    await batch.commit();
    return { id: clubRef.id, ...clubFields };
  } catch (error) {
    if (error?.code === 'firestore/club-not-found' || error?.code === 'firestore/invalid-president') {
      throw error;
    }
    throw createClubError(getClubErrorMessage(error, clubId ? 'update' : 'create'), error?.code);
  }
}

export async function deleteClub(clubId) {
  validateClubId(clubId);

  const clubRef = doc(db, 'clubs', clubId.trim());

  try {
    const existingClub = await getDoc(clubRef);
    if (!existingClub.exists()) {
      throw createClubError('The requested club could not be found.', 'firestore/club-not-found');
    }

    await deleteDoc(clubRef);
    return { id: clubId.trim(), deleted: true };
  } catch (error) {
    throw createClubError(getClubErrorMessage(error, 'delete'), error?.code);
  }
}
