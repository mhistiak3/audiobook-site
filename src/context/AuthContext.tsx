"use client";

import { hybridStorage, invalidateAuthCache } from "@/lib/hybridStorage";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  // Memoize so the same instance is reused across renders, preventing
  // the useEffect dependency from changing every render (infinite loop).
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let cancelled = false;

    // Wrap in try/catch with a 5-second timeout so that an unreachable
    // Supabase instance (ERR_NAME_NOT_RESOLVED, paused project, wrong env
    // var) never leaves the app stuck in a permanent loading state.
    const loadSession = async () => {
      try {
        const timeoutPromise = new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error("Supabase session timeout")), 5000)
        );
        const sessionPromise = supabase.auth.getSession().then(
          ({ data: { session } }) => session?.user ?? null
        );
        const resolvedUser = await Promise.race([sessionPromise, timeoutPromise]);
        if (!cancelled) {
          setUser(resolvedUser);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    loadSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      invalidateAuthCache();
      // Redirect immediately for better UX
      router.push("/");
      router.refresh();

      // Sync localStorage data to Supabase in background
      hybridStorage.syncLocalToSupabase().catch((syncError) => {
        console.error("Error syncing data to Supabase:", syncError);
      });
    }

    return { error };
  };

  const signUp = async (email: string, password: string) => {
    // Get the correct redirect URL
    const redirectUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${redirectUrl}/`,
      },
    });

    if (!error) {
      return { error: null };
    }

    return { error };
  };

  const signOut = async () => {
    // Sync Supabase data to localStorage before logout
    try {
      await hybridStorage.syncSupabaseToLocal();
    } catch (syncError) {
      console.error("Error syncing data to localStorage:", syncError);
    }

    invalidateAuthCache();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
