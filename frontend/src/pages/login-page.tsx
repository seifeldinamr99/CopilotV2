import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Facebook, X } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFbModal, setShowFbModal] = useState(false);
  const [fbLoading, setFbLoading] = useState(false);

  const redirectPath =
    (location.state as { from?: Location })?.from?.pathname ?? "/";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSubmit = async () => {
    setFbLoading(true);
    // Placeholder for Meta OAuth redirect
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setFbLoading(false);
    setShowFbModal(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-foreground">
      <div className="w-full max-w-md rounded-3xl border border-white/5 bg-card p-10 shadow-[0_30px_70px_rgba(0,0,0,0.45)]">
        <div className="space-y-2 text-center">
          <p className="text-sm text-muted-foreground">Meta Ads Platform</p>
          <h1 className="text-3xl font-semibold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in with your Supabase credentials
          </p>
        </div>
        <div className="mt-6">
          <Button
            type="button"
            variant="secondary"
            className="w-full gap-2 bg-[#1b74e4] text-white hover:bg-[#1b74e4]/90"
            onClick={() => setShowFbModal(true)}
          >
            <Facebook className="h-4 w-4" />
            Continue with Facebook
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block space-y-2">
            <span className="text-sm text-muted-foreground">Email</span>
            <input
              type="email"
              className={cn(
                "w-full rounded-2xl border border-white/10 bg-background/40 px-4 py-3 text-sm focus:border-accent focus:outline-none"
              )}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@brand.com"
              required
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm text-muted-foreground">Password</span>
            <input
              type="password"
              className={cn(
                "w-full rounded-2xl border border-white/10 bg-background/40 px-4 py-3 text-sm focus:border-accent focus:outline-none"
              )}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
            />
          </label>
          {error && (
            <p className="text-sm text-destructive">
              {error || "Authentication failed"}
            </p>
          )}
          <Button
            type="submit"
            className="w-full justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </div>
      {showFbModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-[32px] bg-white text-gray-900 shadow-2xl">
            <div className="flex items-center justify-between rounded-t-[32px] bg-[#1877f2] px-6 py-3 text-white">
              <span className="text-lg font-semibold">Facebook</span>
              <button
                className="text-white/80 transition hover:text-white"
                onClick={() => setShowFbModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-6 px-8 py-6">
              <p className="text-sm">
                Log in to use your Facebook account with{" "}
                <span className="font-semibold">Meta Ads Platform.</span>
              </p>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Email address or phone number:
                  <input
                    type="text"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#1877f2] focus:outline-none"
                    placeholder="name@example.com"
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Password:
                  <input
                    type="password"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#1877f2] focus:outline-none"
                    placeholder="********"
                  />
                </label>
              </div>
              <Button
                type="button"
                className="w-full justify-center bg-[#1877f2] text-white hover:bg-[#1458b0]"
                onClick={handleFacebookSubmit}
                disabled={fbLoading}
              >
                {fbLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Log In"
                )}
              </Button>
              <div className="flex flex-col items-center gap-3 text-sm">
                <button className="text-[#1877f2] hover:underline">
                  Forgotten account?
                </button>
                <button className="rounded-md bg-[#42b72a] px-4 py-2 font-semibold text-white hover:bg-[#379322]">
                  Create New Account
                </button>
                <button className="text-[#1877f2] hover:underline">
                  Log in with a managed Meta account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
