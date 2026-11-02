import {
  deleteDoc,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '../services/firebase';
import { getEventById } from './eventRepository';

function createRegistrationError(message, code = 'firestore/event-registration-unknown') {
  const error = new Error(message);
  error.code = code;
  return error;
}

function validateIds(userId, eventId) {
  if (typeof userId !== 'string' || !userId.trim()) {
    throw createRegistrationError('A user ID is required.', 'firestore/invalid-user-id');
  }
  if (typeof eventId !== 'string' || !eventId.trim()) {
    throw createRegistrationError('An event ID is required.', 'firestore/invalid-event-id');
  }
}

function registrationRef(userId, eventId) {
  return doc(db, 'eventRegistrations', `${userId.trim()}_${eventId.trim()}`);
}

function getRegistrationErrorMessage(error) {
  switch (error?.code) {
    case 'permission-denied':
    case 'firestore/permission-denied':
      return 'You do not have permission to manage this registration.';
    case 'unavailable':
    case 'deadline-exceeded':
    case 'auth/network-request-failed':
    case 'firestore/unavailable':
      return 'Unable to complete the registration request. Please check your connection and try again.';
    case 'firestore/registration-exists':
      return 'You are already registered for this event.';
    case 'firestore/event-not-found':
      return 'The requested event could not be found.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export async function registerForEvent(userId, eventId) {
  validateIds(userId, eventId);

  try {
    const event = await getEventById(eventId);
    if (!event) {
      throw createRegistrationError('The requested event could not be found.', 'firestore/event-not-found');
    }

    const ref = registrationRef(userId, eventId);
    await runTransaction(db, async (transaction) => {
      if ((await transaction.get(ref)).exists()) {
        throw createRegistrationError('You are already registered for this event.', 'firestore/registration-exists');
      }

      transaction.set(ref, {
        userId: userId.trim(),
        eventId: eventId.trim(),
        registeredAt: serverTimestamp(),
      });
    });

    return { eventId: eventId.trim(), userId: userId.trim(), registered: true };
  } catch (error) {
    throw createRegistrationError(getRegistrationErrorMessage(error), error?.code);
  }
}

export async function cancelEventRegistration(userId, eventId) {
  validateIds(userId, eventId);

  try {
    await deleteDoc(registrationRef(userId, eventId));
    return { eventId: eventId.trim(), userId: userId.trim(), registered: false };
  } catch (error) {
    throw createRegistrationError(getRegistrationErrorMessage(error), error?.code);
  }
}

export async function checkEventRegistration(userId, eventId) {
  validateIds(userId, eventId);

  try {
    return (await getDoc(registrationRef(userId, eventId))).exists();
  } catch (error) {
    throw createRegistrationError(getRegistrationErrorMessage(error), error?.code);
  }
}
