import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Loader2 } from "lucide-react";

export function AuthGuard() {
  useSupabaseAuth();
  const location = useLocation();
  const status = useAuthStore((state) => state.status);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
