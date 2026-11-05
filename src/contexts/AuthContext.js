import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
  const provisioningProfile = useRef(false);

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
      if (provisioningProfile.current && nextUser) {
        setProfileLoading(true);
        setLoading(false);
        return;
      }
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

  async function register(nextUserData) {
    provisioningProfile.current = true;
    setProfileLoading(true);
    setProfileError(null);
    try {
      const registeredUser = await registerUser(nextUserData);
      setUser(registeredUser);
      await loadUserProfile(registeredUser);
      return registeredUser;
    } finally {
      provisioningProfile.current = false;
      setProfileLoading(false);
    }
  }

  const value = useMemo(
    () => {
      const role = typeof userProfile?.role === 'string'
        ? userProfile.role.trim().toLowerCase()
        : null;

      return {
        user,
        userProfile,
        role,
        presidentOf: userProfile?.presidentOf || null,
        loading,
        profileLoading,
        profileError,
        isAuthenticated: Boolean(user),
        login: loginUser,
        register,
        logout: logoutUser,
        resetPassword,
        refreshUserProfile,
      };
    },
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
