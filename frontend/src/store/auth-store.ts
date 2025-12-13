import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  status: AuthStatus;
  user: User | null;
  session: Session | null;
  setUser: (payload: { user: User | null; session: Session | null }) => void;
  setStatus: (status: AuthStatus) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: "loading",
  user: null,
  session: null,
  setUser: ({ user, session }) =>
    set(() => ({
      user,
      session,
      status: user ? "authenticated" : "unauthenticated",
    })),
  setStatus: (status) => set(() => ({ status })),
}));
