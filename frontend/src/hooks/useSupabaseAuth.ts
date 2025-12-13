import { useEffect } from "react";
import { supabase, hasSupabaseCredentials } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/auth-store";
import type { User } from "@supabase/supabase-js";

export function useSupabaseAuth() {
  const setUser = useAuthStore((state) => state.setUser);
  const setStatus = useAuthStore((state) => state.setStatus);

  useEffect(() => {
    let mounted = true;

    if (!hasSupabaseCredentials) {
      const now = new Date().toISOString();
      const demoUser = {
        id: "demo-user",
        aud: "authenticated",
        role: "authenticated",
        email: "demo@meta-ads.ai",
        phone: "",
        app_metadata: {},
        user_metadata: { full_name: "Demo Marketer" },
        identities: [],
        created_at: now,
        updated_at: now,
        last_sign_in_at: now,
      } as unknown as User;
      setUser({ user: demoUser, session: null });
      return () => undefined;
    }

    setStatus("loading");

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser({ user: data.session?.user ?? null, session: data.session ?? null });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser({ user: session?.user ?? null, session: session ?? null });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setStatus, setUser]);
}
