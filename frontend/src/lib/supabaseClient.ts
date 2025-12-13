import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const hasSupabaseCredentials = Boolean(
  supabaseUrl && supabaseAnonKey
);

function createMockSupabaseClient(): SupabaseClient {
  console.warn(
    "Supabase env vars missing. Using mock auth client – authentication disabled."
  );
  return {
    auth: {
      async getSession() {
        return { data: { session: null }, error: null };
      },
      onAuthStateChange() {
        return {
          data: {
            subscription: {
              unsubscribe() {
                /* noop */
              },
            },
          },
        };
      },
      async signInWithPassword() {
        return {
          data: { user: null, session: null },
          error: new Error("Supabase credentials not configured."),
        };
      },
    },
  } as unknown as SupabaseClient;
}

export const supabase = hasSupabaseCredentials
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockSupabaseClient();
