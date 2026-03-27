"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
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
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supabase] = useState(() => createClient());
  const router = useRouter();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) {
        console.error("[AuthProvider] fetchProfile Supabase error:", error.message);
      } else if (data) {
        setProfile(data as Profile);
        console.log("[AuthProvider] Profile loaded:", data.role, data.company_name ?? data.first_name);
      }
    } catch (e) {
      console.error("[AuthProvider] fetchProfile exception:", e);
    }
  };

  useEffect(() => {
    console.log("[AuthProvider] Mounting, subscribing to onAuthStateChange");

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[AuthProvider] Auth event:", event, "| user:", session?.user?.id ?? "null");

      try {
        if (session?.user) {
          setUser(session.user);
          if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "USER_UPDATED") {
            // Race fetchProfile against a 5-second timeout so isLoading never hangs forever
            await Promise.race([
              fetchProfile(session.user.id),
              new Promise<void>(resolve => setTimeout(resolve, 5000)),
            ]);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (e) {
        console.error("[AuthProvider] onAuthStateChange handler error:", e);
      } finally {
        // Always release isLoading — no matter what happens above
        console.log("[AuthProvider] Setting isLoading = false");
        setIsLoading(false);
      }

      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        router.refresh();
      }
    });

    return () => {
      console.log("[AuthProvider] Unmounting, unsubscribing");
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, signOut }}>
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
