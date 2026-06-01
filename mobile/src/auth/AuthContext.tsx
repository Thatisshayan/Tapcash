import { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { auth } from "../lib/firebase";

type AuthContextValue = {
  user: User | null;
  verified: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshSession: () => Promise<User | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshTokenRef = useRef(0);
  const mountedRef = useRef(true);

  const syncCurrentUser = async (nextUser: User | null) => {
    const token = ++refreshTokenRef.current;

    if (!nextUser) {
      if (token === refreshTokenRef.current && mountedRef.current) {
        setUser(null);
      }
      return null;
    }

    try {
      await nextUser.reload();
    } catch (error) {
      console.warn("Mobile auth session refresh failed:", error);
    }

    if (token !== refreshTokenRef.current) {
      return auth.currentUser ?? nextUser;
    }

    const refreshedUser = auth.currentUser ?? nextUser;
    if (mountedRef.current) {
      setUser(refreshedUser);
    }
    return refreshedUser;
  };

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      if (!active) {
        return;
      }

      void syncCurrentUser(nextUser).finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    });

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active" && auth.currentUser) {
        void syncCurrentUser(auth.currentUser);
      }
    });

    return () => {
      active = false;
      mountedRef.current = false;
      unsubscribe();
      subscription.remove();
    };
  }, []);

  const refreshSession = async () => {
    if (!auth.currentUser) {
      refreshTokenRef.current += 1;
      if (mountedRef.current) {
        setUser(null);
      }
      return null;
    }

    return syncCurrentUser(auth.currentUser);
  };

  const resendVerificationEmail = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("Sign in first to resend the verification email.");
    }

    await sendEmailVerification(currentUser);
  };

  const value: AuthContextValue = {
    user,
    verified: Boolean(user?.emailVerified),
    loading,
    signIn: async (email, password) => {
      await signInWithEmailAndPassword(auth, email, password);
      await refreshSession();
    },
    signUp: async (email, password) => {
      await createUserWithEmailAndPassword(auth, email, password);
      await refreshSession();
    },
    resendVerificationEmail,
    refreshSession,
    logout: async () => {
      refreshTokenRef.current += 1;
      await signOut(auth);
      if (mountedRef.current) {
        setUser(null);
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
