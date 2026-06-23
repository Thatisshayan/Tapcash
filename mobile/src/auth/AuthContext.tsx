import { createContext, PropsWithChildren, useContext, useEffect, useRef, useState, useCallback } from "react";
import { AppState } from "react-native";
import { isDevice } from "expo-device";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { registerPushToken, setupNotificationHandlers } from "../lib/notifications";

type AuthContextValue = {
  user: User | null;
  verified: boolean;
  loading: boolean;
  biometricAvailable: boolean;
  notificationPermissionDenied: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshSession: () => Promise<User | null>;
  logout: () => Promise<void>;
  signInWithBiometrics: () => Promise<boolean>;
  enableNotifications: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationPermissionDenied, setNotificationPermissionDenied] = useState(false);
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

  const handleAuthSuccess = useCallback(async () => {
    await refreshSession();
    await registerPushToken();
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

  useEffect(() => {
    let active = true;

    setupNotificationHandlers(async (newToken) => {
      const idToken = await auth.currentUser?.getIdToken();
      if (idToken) {
        await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/user/push-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ pushToken: newToken }),
        }).catch(() => {});
      }
    });

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      if (!active) {
        return;
      }

      void syncCurrentUser(nextUser).finally(() => {
        if (active) {
          setLoading(false);
          SplashScreen.hideAsync().catch(() => {});
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

  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    LocalAuthentication.hasHardwareAsync().then((hasHardware) => {
      if (hasHardware) {
        LocalAuthentication.supportedAuthenticationTypesAsync().then((types) => {
          const hasSupported = types.length > 0;
          setBiometricAvailable(hasSupported && isDevice);
        });
      }
    });
  }, []);

  const signInWithBiometrics = useCallback(async (): Promise<boolean> => {
    if (!biometricAvailable) return false;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate to access TapCash",
      cancelLabel: "Cancel",
      disableDeviceFallback: false,
    });

    if (!result.success) return false;

    const savedCreds = await SecureStore.getItemAsync("tapcash_creds");
    if (!savedCreds) return false;

    try {
      const { email, password } = JSON.parse(savedCreds) as { email: string; password: string };
      await signInWithEmailAndPassword(auth, email, password);
      await handleAuthSuccess();
      return true;
    } catch (error: unknown) {
      console.error("Biometric sign-in failed:", error);
      return false;
    }
  }, [biometricAvailable]);

  const checkNotificationPermission = useCallback(async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setNotificationPermissionDenied(status === "denied");
  }, []);

  useEffect(() => {
    checkNotificationPermission();
  }, [checkNotificationPermission]);

  const enableNotifications = useCallback(async (): Promise<boolean> => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === "granted") {
      setNotificationPermissionDenied(false);
      await registerPushToken();
      return true;
    }
    return false;
  }, []);

  const resendVerificationEmail = useCallback(async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    verified: Boolean(user?.emailVerified),
    loading,
    biometricAvailable,
    notificationPermissionDenied,
    signIn: async (email, password) => {
      await signInWithEmailAndPassword(auth, email, password);
      await SecureStore.setItemAsync("tapcash_creds", JSON.stringify({ email, password }));
      await handleAuthSuccess();
    },
    signUp: async (email, password) => {
      await createUserWithEmailAndPassword(auth, email, password);
      await SecureStore.setItemAsync("tapcash_creds", JSON.stringify({ email, password }));
      await handleAuthSuccess();
    },
    resendVerificationEmail,
    refreshSession,
    logout: async () => {
      refreshTokenRef.current += 1;
      await SecureStore.deleteItemAsync("tapcash_creds");
      await signOut(auth);
      if (mountedRef.current) {
        setUser(null);
      }
    },
    signInWithBiometrics,
    enableNotifications,
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