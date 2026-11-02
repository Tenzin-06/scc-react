import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

import {
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
} from '../repositories/authRepository';
import { getUserProfile } from '../repositories/userRepository';
import { auth } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  async function loadUserProfile(nextUser) {
    if (!nextUser) {
      setUserProfile(null);
      setProfileError(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    setProfileError(null);
    try {
      setUserProfile(await getUserProfile(nextUser.uid));
    } catch (error) {
      setUserProfile(null);
      setProfileError(error);
    } finally {
      setProfileLoading(false);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      await loadUserProfile(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function refreshUserProfile() {
    if (!user) {
      setUserProfile(null);
      return null;
    }

    setProfileLoading(true);
    setProfileError(null);
    try {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
      return profile;
    } catch (error) {
      setProfileError(error);
      throw error;
    } finally {
      setProfileLoading(false);
    }
  }

  const value = useMemo(
    () => ({
      user,
      userProfile,
      loading,
      profileLoading,
      profileError,
      isAuthenticated: Boolean(user),
      login: loginUser,
      register: registerUser,
      logout: logoutUser,
      resetPassword,
      refreshUserProfile,
    }),
    [loading, profileError, profileLoading, user, userProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider.');
  }

  return context;
}
