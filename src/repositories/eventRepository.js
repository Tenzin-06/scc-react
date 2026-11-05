import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

import { db } from '../services/firebase';

const eventsCollection = collection(db, 'events');
const eventListeners = new Set();
let unsubscribeFromEvents = null;
const editableFields = new Set([
  'title',
  'description',
  'date',
  'time',
  'location',
  'clubId',
  'imageUrl',
]);
const requiredFields = ['title', 'description', 'date', 'time', 'location', 'clubId'];

function createEventError(message, code = 'firestore/event-unknown') {
  const error = new Error(message);
  error.code = code;
  return error;
}

function validateId(eventId) {
  if (typeof eventId !== 'string' || !eventId.trim()) {
    throw createEventError('An event ID is required.', 'firestore/invalid-event-id');
  }
}

function validateText(value, field) {
  if (typeof value !== 'string' || !value.trim()) {
    throw createEventError(`A ${field} is required.`, `firestore/missing-event-${field}`);
  }
}

function validateEventData(eventData = {}) {
  if (!eventData || typeof eventData !== 'object' || Array.isArray(eventData)) {
    throw createEventError('Event details are required.', 'firestore/invalid-event-data');
  }

  for (const field of requiredFields) {
    validateText(eventData[field], field);
  }
}

function normalizeImageUrl(value) {
  if (value === undefined || value === null) {
    return '';
  }

  if (typeof value !== 'string') {
    throw createEventError('The event image URL must be text.', 'firestore/invalid-event-image-url');
  }

  return value.trim();
}

function toEvent(snapshot) {
  return {
    ...snapshot.data(),
    id: snapshot.id,
  };
}

export function subscribeToAllEvents(onEvents, onError) {
  const subscriber = { onEvents, onError };
  eventListeners.add(subscriber);

  if (!unsubscribeFromEvents) {
    unsubscribeFromEvents = onSnapshot(
      eventsCollection,
      (snapshot) => {
        const events = snapshot.docs.map(toEvent);
        eventListeners.forEach((listener) => listener.onEvents(events));
      },
      (error) => {
        const readError = createEventError(getEventErrorMessage(error, 'read'), error?.code);
        eventListeners.forEach((listener) => listener.onError?.(readError));
      },
    );
  }

  return () => {
    eventListeners.delete(subscriber);
    if (eventListeners.size === 0 && unsubscribeFromEvents) {
      unsubscribeFromEvents();
      unsubscribeFromEvents = null;
    }
  };
}

function getEventErrorMessage(error, operation) {
  switch (error?.code) {
    case 'permission-denied':
    case 'firestore/permission-denied':
      return 'You do not have permission to access events.';
    case 'unauthenticated':
    case 'auth/id-token-expired':
    case 'auth/user-token-expired':
      return 'Your session has expired. Please log in again.';
    case 'unavailable':
    case 'deadline-exceeded':
    case 'auth/network-request-failed':
    case 'firestore/unavailable':
      return 'Unable to complete the event request. Please check your connection and try again.';
    case 'firestore/event-not-found':
      return 'The requested event could not be found.';
    default:
      return operation === 'read'
        ? 'Unable to load events. Please check your connection and try again.'
        : operation === 'delete'
          ? 'Unable to delete the event. Please try again.'
          : 'Unable to save the event. Please try again.';
  }
}

export async function createEvent(eventData = {}) {
  validateEventData(eventData);

  const event = {
    title: eventData.title.trim(),
    description: eventData.description.trim(),
    date: eventData.date.trim(),
    time: eventData.time.trim(),
    location: eventData.location.trim(),
    clubId: eventData.clubId.trim(),
    imageUrl: normalizeImageUrl(eventData.imageUrl),
    createdAt: serverTimestamp(),
  };

  try {
    const snapshot = await addDoc(eventsCollection, event);
    return {
      id: snapshot.id,
      ...event,
    };
  } catch (error) {
    throw createEventError(getEventErrorMessage(error, 'create'), error?.code);
  }
}

export async function getAllEvents() {
  try {
    const snapshot = await getDocs(eventsCollection);
    return snapshot.docs.map(toEvent);
  } catch (error) {
    throw createEventError(getEventErrorMessage(error, 'read'), error?.code);
  }
}

export async function getEventById(eventId) {
  validateId(eventId);

  try {
    const snapshot = await getDoc(doc(db, 'events', eventId.trim()));
    return snapshot.exists() ? toEvent(snapshot) : null;
  } catch (error) {
    throw createEventError(getEventErrorMessage(error, 'read'), error?.code);
  }
}

export async function updateEvent(eventId, updatedData = {}) {
  validateId(eventId);

  if (!updatedData || typeof updatedData !== 'object' || Array.isArray(updatedData)) {
    throw createEventError('Event changes are required.', 'firestore/invalid-event-data');
  }

  const permittedUpdates = Object.entries(updatedData).reduce(
    (updates, [field, value]) => {
      if (!editableFields.has(field) || value === undefined) {
        return updates;
      }

      if (requiredFields.includes(field)) {
        validateText(value, field);
        updates[field] = value.trim();
      } else {
        updates[field] = normalizeImageUrl(value);
      }

      return updates;
    },
    {},
  );

  if (Object.keys(permittedUpdates).length === 0) {
    throw createEventError('No permitted event changes were provided.', 'firestore/no-event-changes');
  }

  const eventRef = doc(db, 'events', eventId.trim());

  try {
    const existingEvent = await getDoc(eventRef);
    if (!existingEvent.exists()) {
      throw createEventError('The requested event could not be found.', 'firestore/event-not-found');
    }

    await updateDoc(eventRef, permittedUpdates);
    return { id: eventId.trim(), ...permittedUpdates };
  } catch (error) {
    throw createEventError(getEventErrorMessage(error, 'update'), error?.code);
  }
}

export async function deleteEvent(eventId) {
  validateId(eventId);

  const eventRef = doc(db, 'events', eventId.trim());

  try {
    const existingEvent = await getDoc(eventRef);
    if (!existingEvent.exists()) {
      throw createEventError('The requested event could not be found.', 'firestore/event-not-found');
    }

    await deleteDoc(eventRef);
    return { id: eventId.trim(), deleted: true };
  } catch (error) {
    throw createEventError(getEventErrorMessage(error, 'delete'), error?.code);
  }
}
