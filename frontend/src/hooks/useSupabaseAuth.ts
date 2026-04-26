import { useEffect } from "react";
import { supabase, hasSupabaseCredentials } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/auth-store";

export function useSupabaseAuth() {
  const setUser = useAuthStore((state) => state.setUser);
  const setStatus = useAuthStore((state) => state.setStatus);

  useEffect(() => {
    let mounted = true;

    if (!hasSupabaseCredentials) {
      setUser({ user: null, session: null });
      setStatus("unauthenticated");
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
