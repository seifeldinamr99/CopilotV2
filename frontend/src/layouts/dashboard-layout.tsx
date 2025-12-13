import { NavLink, Outlet } from "react-router-dom";
import {
  Activity,
  Brain,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useMetaConnection } from "@/hooks/useMetaConnection";

const navItems = [
  { label: "Home", icon: LayoutDashboard, path: "/" },
  { label: "AI Ads", icon: Brain, path: "/ai-ads" },
  { label: "Analytics", icon: Activity, path: "/analytics" },
];

export function DashboardLayout() {
  const user = useAuthStore((state) => state.user);
  const { status, connect, lastSync } = useMetaConnection();

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden lg:flex w-24 flex-col items-center gap-6 border-r border-white/5 bg-sidebar/80 py-10">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  "flex h-12 w-12 items-center justify-center rounded-2xl border transition-all",
                  isActive
                    ? "border-accent bg-accent/20 text-accent"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-white/10",
                ].join(" ")
              }
            >
              <Icon className="h-5 w-5" />
            </NavLink>
          );
        })}
        <div className="mt-auto space-y-4">
          <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 text-muted-foreground hover:text-foreground">
            <Settings className="h-5 w-5" />
          </button>
          <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 text-muted-foreground hover:text-destructive">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex flex-col gap-6 border-b border-white/5 bg-background/80 px-6 py-6 backdrop-blur-xl md:flex-row md:items-center md:justify-between md:px-10">
          <div>
            <p className="text-sm text-muted-foreground">
              {greeting}, {user?.user_metadata?.full_name ?? user?.email}
            </p>
            <h1 className="text-2xl font-semibold text-foreground">
              4 AI recommendations waiting
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant={status === "connected" ? "success" : "secondary"}
              className="gap-2"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  status === "connected"
                    ? "bg-success"
                    : status === "connecting"
                      ? "bg-warning"
                      : "bg-muted-foreground"
                }`}
              />
              Meta {status === "connected" ? "connected" : "disconnected"}
              {lastSync && (
                <span className="text-xs text-muted-foreground">
                  • Synced {lastSync}
                </span>
              )}
            </Badge>
            <Button
              variant={status === "connected" ? "secondary" : "default"}
              onClick={connect}
              disabled={status === "connecting"}
            >
              {status === "connected"
                ? "Refresh data"
                : status === "connecting"
                  ? "Connecting..."
                  : "Connect Meta Business"}
            </Button>
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                {user?.email?.slice(0, 2).toUpperCase() ?? "AG"}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
