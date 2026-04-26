import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Facebook } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fbLoading, setFbLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");

  const redirectPath =
    (location.state as { from?: Location })?.from?.pathname ?? "/";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const cleanEmail = email
        .normalize("NFKC")
        .replace(/[\u200B-\u200D\uFEFF]/g, "")
        .replace(/\s+/g, "")
        .trim()
        .toLowerCase();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        setError(`Invalid email format: "${cleanEmail}"`);
        return;
      }

      const { error: authError } =
        mode === "signup"
          ? await supabase.auth.signUp({
              email: cleanEmail,
              password,
              options: {
                data: name ? { full_name: name } : undefined,
              },
            })
          : await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (authError) throw authError;
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error("Supabase auth error:", err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookOAuthLogin = async () => {
    setFbLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (err) {
      setError((err as Error).message);
      setFbLoading(false);
    }
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
        <div className="mt-6 space-y-3">
          <Button
            type="button"
            variant="secondary"
            className="w-full gap-2 bg-[#1b74e4] text-white hover:bg-[#1b74e4]/90"
            onClick={handleFacebookOAuthLogin}
            disabled={fbLoading}
          >
            <Facebook className="h-4 w-4" />
            {fbLoading ? "Redirecting..." : "Continue with Facebook"}
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {mode === "signup" && (
            <label className="block space-y-2">
              <span className="text-sm text-muted-foreground">Name</span>
              <input
                type="text"
                className={cn(
                  "w-full rounded-2xl border border-white/10 bg-background/40 px-4 py-3 text-sm focus:border-accent focus:outline-none"
                )}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </label>
          )}
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
                {mode === "signup" ? "Creating account..." : "Signing in..."}
              </>
            ) : (
              mode === "signup" ? "Create account" : "Sign in"
            )}
          </Button>
          <button
            type="button"
            className="w-full text-sm text-muted-foreground hover:text-foreground"
            onClick={() => {
              setError(null);
              setMode((m) => (m === "login" ? "signup" : "login"));
            }}
          >
            {mode === "signup"
              ? "Already have an account? Sign in"
              : "New here? Create an account"}
          </button>
        </form>
      </div>
    </div>
  );
}
