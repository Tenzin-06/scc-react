import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { auth, db } from '../services/firebase';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function createAuthError(message, code = 'auth/unknown') {
  const error = new Error(message);
  error.code = code;
  return error;
}

function getAuthErrorMessage(error, operation) {
  switch (error?.code) {
    case 'auth/missing-email':
      return 'Please enter your email.';
    case 'auth/missing-password':
      return 'Please enter your password.';
    case 'auth/missing-name':
      return 'Please enter your full name.';
    case 'auth/missing-student-id':
      return 'Please enter your Student ID.';
    case 'auth/password-mismatch':
      return 'Passwords do not match.';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Incorrect email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password is too weak.';
    case 'auth/invalid-email':
      return 'Please enter a valid email.';
    case 'auth/network-request-failed':
      return 'Check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return operation === 'reset'
        ? 'Unable to send the password reset email. Please try again.'
        : 'Something went wrong. Please try again.';
  }
}

function validateCredentials(email, password) {
  if (!email?.trim()) {
    throw createAuthError('Please enter your email.', 'auth/missing-email');
  }

  if (!validateEmail(email)) {
    throw createAuthError('Please enter a valid email.', 'auth/invalid-email');
  }

  if (!password) {
    throw createAuthError('Please enter your password.', 'auth/missing-password');
  }
}

function validateRegistration({ fullName, studentId, email, password, confirmPassword }) {
  if (!fullName?.trim()) {
    throw createAuthError('Please enter your full name.', 'auth/missing-name');
  }

  if (!studentId?.trim()) {
    throw createAuthError('Please enter your Student ID.', 'auth/missing-student-id');
  }

  validateCredentials(email, password);

  if (password.length < 6) {
    throw createAuthError('Password is too weak.', 'auth/weak-password');
  }

  if (password !== confirmPassword) {
    throw createAuthError('Passwords do not match.', 'auth/password-mismatch');
  }
}

export async function registerUser(userData) {
  validateRegistration(userData);

  const { fullName, studentId, email, password } = userData;
  let credential;

  try {
    credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await updateProfile(credential.user, { displayName: fullName.trim() });

    await setDoc(doc(db, 'users', credential.user.uid), {
      uid: credential.user.uid,
      fullName: fullName.trim(),
      studentId: studentId.trim(),
      email: email.trim(),
      role: 'student',
      createdAt: serverTimestamp(),
    });

    return credential.user;
  } catch (error) {
    if (credential?.user) {
      try {
        await signOut(auth);
      } catch {
        // The original registration error is more useful to the caller.
      }
    }

    if (error?.code?.startsWith('auth/')) {
      throw createAuthError(getAuthErrorMessage(error, 'register'), error.code);
    }

    throw createAuthError(
      'Your account was created, but the student profile could not be saved. Please contact support before trying again.',
      'firestore/profile-creation-failed',
    );
  }
}

export async function loginUser(email, password) {
  try {
    validateCredentials(email, password);
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return credential.user;
  } catch (error) {
    if (error?.code?.startsWith('auth/')) {
      throw createAuthError(getAuthErrorMessage(error, 'login'), error.code);
    }

    throw error;
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    throw createAuthError('Unable to log out. Please try again.', error?.code);
  }
}

export async function resetPassword(email) {
  if (!email?.trim()) {
    throw createAuthError('Please enter your email.', 'auth/missing-email');
  }

  if (!validateEmail(email)) {
    throw createAuthError('Please enter a valid email.', 'auth/invalid-email');
  }

  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error) {
    throw createAuthError(getAuthErrorMessage(error, 'reset'), error?.code);
  }
}

export function getCurrentUser() {
  return auth.currentUser;
}

export async function getUserProfile(user) {
  if (!user) {
    return null;
  }

  const snapshot = await getDoc(doc(db, 'users', user.uid));
  return snapshot.exists() ? snapshot.data() : null;
}
