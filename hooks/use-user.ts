"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Supabase client with error handling
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);

  useEffect(() => {
    try {
      const client = createClient();
      setSupabase(client);
    } catch (err) {
      console.error("Failed to initialize Supabase client:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize Supabase client");
      setLoading(false);
      return;
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;

    // Get user on mount
    getUser();

    // Listen for changes on auth state (login, sign out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function getUser() {
    if (!supabase) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setError(null);
    } catch (error) {
      console.error("Error getting user:", error);
      setError(error instanceof Error ? error.message : "Failed to get user");
    } finally {
      setLoading(false);
    }
  }

  return { user, loading, error };
}
