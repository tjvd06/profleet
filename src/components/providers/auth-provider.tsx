"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";

type Profile = {
  id: string;
  role: "nachfrager" | "anbieter";
  company_name: string | null;
  first_name: string | null;
  last_name: string | null;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  devModeRole: "nachfrager" | "anbieter" | null;
  setDevModeRole: (role: "nachfrager" | "anbieter" | null) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  signOut: async () => {},
  devModeRole: null,
  setDevModeRole: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [devModeRole, setDevModeRole] = useState<"nachfrager" | "anbieter" | null>(null);
  const [supabase] = useState(() => createClient());
  const initialized = useRef(false);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!error && data) {
        setProfile(data as Profile);
      } else {
        console.warn("[AuthProvider] Profile fetch error:", error?.message);
      }
    } catch (e) {
      console.error("[AuthProvider] Profile exception:", e);
    }
  };

  useEffect(() => {
    // Prevent double-init in React StrictMode
    if (initialized.current) return;
    initialized.current = true;

    console.log("[AuthProvider] Initializing...");

    // 1. Get initial session
    supabase.auth.getUser().then(async ({ data: { user: currentUser } }) => {
      console.log("[AuthProvider] getUser result:", currentUser?.id ?? "no user");
      if (currentUser) {
        setUser(currentUser);
        await fetchProfile(currentUser.id);
      }
      setIsLoading(false);
      console.log("[AuthProvider] isLoading = false");
    }).catch((err) => {
      console.error("[AuthProvider] getUser error:", err);
      setIsLoading(false);
    });

    // 2. Listen for changes (login, logout, token refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[AuthProvider] onAuthStateChange:", event);
        if (session?.user) {
          setUser(session.user);
          // Don't block on profile fetch for auth state changes
          fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, signOut, devModeRole, setDevModeRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
