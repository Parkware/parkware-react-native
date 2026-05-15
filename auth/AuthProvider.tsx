import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { registerForPushNotificationsAsync } from "../services/notifications";
import { UserProfile } from "../types/users";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loggedAsProvider: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setProfile(null);
      setLoadingAuth(false);
      setLoadingProfile(Boolean(nextUser));
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setLoadingProfile(false);
      return undefined;
    }

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        setProfile(snapshot.exists() ? (snapshot.data() as UserProfile) : null);
        setLoadingProfile(false);
      },
      () => setLoadingProfile(false),
    );

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!user || !profile) {
      return;
    }

    let cancelled = false;

    registerForPushNotificationsAsync()
      .then(async (expoPushToken) => {
        if (!cancelled && expoPushToken) {
          await setDoc(doc(db, "users", user.uid), { expoPushToken }, { merge: true });
        }
      })
      .catch((error) => console.log("Failed to register push notifications", error));

    return () => {
      cancelled = true;
    };
  }, [profile, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loggedAsProvider: Boolean(profile?.loggedAsProvider),
      loading: loadingAuth || loadingProfile,
    }),
    [loadingAuth, loadingProfile, profile, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthProfile = () => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuthProfile must be used within AuthProvider");
  }

  return value;
};
