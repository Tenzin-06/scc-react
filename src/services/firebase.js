import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const requiredConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const missingConfig = Object.entries(requiredConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingConfig.length > 0) {
  throw new Error(
    `Firebase configuration is incomplete. Missing environment variables: ${missingConfig
      .map((key) => `EXPO_PUBLIC_FIREBASE_${key.replace(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase()}`)
      .join(', ')}`,
  );
}

let firebaseApp;

try {
  firebaseApp = getApps().length > 0 ? getApp() : initializeApp(requiredConfig);
} catch (error) {
  throw new Error(
    `Firebase failed to initialize. Check the Firebase configuration and project settings. ${
      error instanceof Error ? error.message : 'Unknown initialization error.'
    }`,
  );
}

let auth;
let db;

try {
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
} catch (error) {
  throw new Error(
    `Firebase services failed to initialize. ${
      error instanceof Error ? error.message : 'Unknown service initialization error.'
    }`,
  );
}

export { firebaseApp, auth, db };
