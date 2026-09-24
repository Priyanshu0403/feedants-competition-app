import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authApi from '../api/authApi';

const AuthContext = createContext(null);
const TOKEN_KEY = 'feedants_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  // On app launch, try to resume a session from a previously stored token.
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(TOKEN_KEY);
        if (stored) {
          setToken(stored);
          const res = await authApi.me();
          setUser(res.data.user);
        }
      } catch (err) {
        await AsyncStorage.removeItem(TOKEN_KEY);
      } finally {
        setIsBootstrapping(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (email, password) => {
    const res = await authApi.login(email, password);
    await AsyncStorage.setItem(TOKEN_KEY, res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, isAuthenticated: Boolean(token), isBootstrapping, signIn, signOut }),
    [user, token, isBootstrapping, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>');
  return ctx;
}
