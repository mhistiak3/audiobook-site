"use client";

import { hybridStorage } from "@/lib/hybridStorage";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

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
  const supabase = createClient();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      // Sync localStorage data to Supabase after successful login
      try {
        await hybridStorage.syncLocalToSupabase();
      } catch (syncError) {
        console.error("Error syncing data to Supabase:", syncError);
      }

      router.push("/");
      router.refresh();
    }

    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/`
      : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000/';
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (!error) {
      router.push("/");
      router.refresh();
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
