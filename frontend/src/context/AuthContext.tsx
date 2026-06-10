import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import * as authApi from '../api/auth';
import { setAuthToken, setUnauthorizedHandler } from '../api/client';
import { authStorage } from '../storage/authStorage';
import type { LoginPayload, ProfilePayload, RegisterPayload, User } from '../types/auth';

interface AuthContextValue {
  user: User | null;
  initializing: boolean;
  signIn: (payload: LoginPayload) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  updateProfile: (payload: ProfilePayload) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  const applySession = useCallback(async (token: string, sessionUser: User) => {
    setAuthToken(token);
    await authStorage.setToken(token);
    setUser(sessionUser);
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    setAuthToken(null);
    await authStorage.clearToken();
  }, []);

  const signIn = useCallback(
    async (payload: LoginPayload) => {
      const result = await authApi.login(payload);
      await applySession(result.token, result.user);
    },
    [applySession],
  );

  const signUp = useCallback(
    async (payload: RegisterPayload) => {
      const result = await authApi.register(payload);
      await applySession(result.token, result.user);
    },
    [applySession],
  );

  const updateProfile = useCallback(async (payload: ProfilePayload) => {
    const updated = await authApi.updateProfile(payload);
    setUser(updated);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void signOut();
    });

    (async () => {
      const token = await authStorage.getToken();
      if (token) {
        setAuthToken(token);
        try {
          setUser(await authApi.me());
        } catch {
          await signOut();
        }
      }
      setInitializing(false);
    })();

    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  const value = useMemo(
    () => ({ user, initializing, signIn, signUp, updateProfile, signOut }),
    [user, initializing, signIn, signUp, updateProfile, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider.');
  }
  return context;
}
