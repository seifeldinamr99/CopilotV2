import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Activity,
  Brain,
  ChevronsLeft,
  ChevronsRight,
  Home,
  LogOut,
  Moon,
  Paintbrush,
  Sun,
  Settings,
  ClipboardList,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMetaConnection } from "@/hooks/useMetaConnection";
import { useMetaStore } from "@/store/meta-store";
import { useShopifyConnection } from "@/hooks/useShopifyConnection";
import { ShopifyConnectModal } from "@/components/shopify-connect-modal";
import { useI18n } from "@/lib/i18n";

const navItems = [
  { key: "nav.home", icon: Home, path: "/" },
  { key: "nav.creativeStudio", icon: Paintbrush, path: "/ai-ads" },
  { key: "nav.workStation", icon: ClipboardList, path: "/work-station" },
  { key: "nav.analytics", icon: Activity, path: "/analytics" },
];

export function DashboardLayout() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const {
    status: metaStatus,
    connect: connectMeta,
    disconnect: disconnectMeta,
  } = useMetaConnection();
  const {
    status: shopifyStatus,
    connect: connectShopify,
    disconnect: disconnectShopify,
    shopDomain,
  } = useShopifyConnection();

  const metaProfile = useMetaStore((s) => s.profile);
  const metaAdAccounts = useMetaStore((s) => s.adAccounts);
  const selectedAdAccountId = useMetaStore((s) => s.selectedAdAccountId);
  const setSelectedAdAccountId = useMetaStore((s) => s.setSelectedAdAccountId);
  const { locale, setLocale, t } = useI18n();

  const displayName = metaProfile?.name ?? (user?.user_metadata?.full_name ?? user?.email);
  const [shopifyModalOpen, setShopifyModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [disconnectTarget, setDisconnectTarget] = useState<"meta" | "shopify" | null>(null);
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("theme-light", isLightMode);
  }, [isLightMode]);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return t("nav.greeting.morning");
    if (hour < 18) return t("nav.greeting.afternoon");
    return t("nav.greeting.evening");
  })();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside
        className={[
          "sticky top-0 hidden h-screen flex-col gap-6 overflow-hidden border-r border-white/5 bg-sidebar/80 py-10 transition-all duration-300 lg:flex",
          isSidebarCollapsed ? "w-20 px-3" : "w-60 px-5",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed((prev) => !prev)}
          className={[
            "absolute top-8 z-50 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-background/90 text-muted-foreground shadow-lg transition hover:text-foreground",
            locale === "ar" ? "-left-3" : "-right-3",
          ].join(" ")}
        >
          {locale === "ar" ? (
            isSidebarCollapsed ? (
              <ChevronsLeft className="h-4 w-4" />
            ) : (
              <ChevronsRight className="h-4 w-4" />
            )
          ) : isSidebarCollapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <ChevronsLeft className="h-4 w-4" />
          )}
        </button>

        <div
          className={[
            "mt-2 flex flex-1 flex-col gap-2",
            isSidebarCollapsed ? "items-center" : "items-stretch",
          ].join(" ")}
        >
          <div
            className={[
              "px-3 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground/70",
              isSidebarCollapsed ? "text-center" : locale === "ar" ? "text-right" : "text-left",
            ].join(" ")}
          >
            {t("nav.metaCopilot")}
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  [
                    "group flex items-center gap-3 rounded-2xl px-3 py-3 transition-all",
                    isActive
                      ? "bg-accent/15 text-accent"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                    isSidebarCollapsed ? "justify-center px-0" : "justify-start",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={[
                        "flex h-10 w-10 items-center justify-center rounded-2xl transition",
                        isActive
                          ? "bg-accent/10 text-accent"
                          : "bg-black/20 text-muted-foreground group-hover:text-foreground",
                      ].join(" ")}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                  <span
                    className={[
                      "text-sm font-medium transition-all duration-300",
                      isSidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100",
                    ].join(" ")}
                  >
                      {t(item.key)}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
        </div>

        <div
          className={[
            "mt-auto space-y-3 pt-2 flex flex-col",
            isSidebarCollapsed ? "items-center" : "items-stretch",
          ].join(" ")}
        >
          <button
            className={[
              "flex items-center gap-3 rounded-2xl px-3 py-3 text-muted-foreground transition hover:bg-white/5 hover:text-foreground",
              isSidebarCollapsed ? "justify-center px-0" : "justify-start",
            ].join(" ")}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/20">
              <Settings className="h-5 w-5" />
            </span>
            <span
              className={[
                "text-sm font-medium transition-all duration-300",
                isSidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100",
              ].join(" ")}
            >
              {t("nav.settings")}
            </span>
          </button>
          <button
            className={[
              "flex items-center gap-3 rounded-2xl px-3 py-3 text-muted-foreground transition hover:bg-white/5 hover:text-destructive",
              isSidebarCollapsed ? "justify-center px-0" : "justify-start",
            ].join(" ")}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/20">
              <LogOut className="h-5 w-5" />
            </span>
            <span
              className={[
                "text-sm font-medium transition-all duration-300",
                isSidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100",
              ].join(" ")}
            >
              {t("nav.logout")}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setLocale(locale === "en" ? "ar" : "en")}
            className={[
              "flex items-center gap-3 rounded-2xl px-3 py-3 text-muted-foreground transition hover:bg-white/5 hover:text-foreground",
              isSidebarCollapsed ? "justify-center px-0" : "justify-start",
            ].join(" ")}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/20 text-[10px] font-bold">
              {locale === "en" ? "AR" : "EN"}
            </span>
            <span
              className={[
                "text-sm font-medium transition-all duration-300",
                isSidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100",
              ].join(" ")}
            >
              {locale === "en" ? "العربية" : "English"}
            </span>
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        {location.pathname !== "/ai-chat" && (
          <header className="flex flex-col gap-6 border-b border-white/5 bg-background/80 px-6 py-6 backdrop-blur-xl md:flex-row md:items-center md:justify-between md:px-10">
            <div>
              <p className="text-sm text-muted-foreground">
                {greeting}, {displayName}
              </p>
              <h1 className="text-2xl font-semibold text-foreground">
                {t("header.recommendationsWaiting", { count: 4 })}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-background/40 p-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (metaStatus === "connected") {
                      setDisconnectTarget("meta");
                      return;
                    }
                    await connectMeta();
                  }}
                  className="rounded-full transition hover:brightness-110"
                >
                  <Badge variant={metaStatus === "connected" ? "success" : "secondary"} className="gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        metaStatus === "connected"
                          ? "bg-success"
                          : metaStatus === "connecting"
                            ? "bg-warning"
                            : "bg-muted-foreground"
                      }`}
                    />
                    Meta {metaStatus === "connected" ? "connected" : "disconnected"}
                  </Badge>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    if (shopifyStatus === "connected") {
                      setDisconnectTarget("shopify");
                      return;
                    }
                    setShopifyModalOpen(true);
                  }}
                  className="rounded-full transition hover:brightness-110"
                >
                  <Badge variant={shopifyStatus === "connected" ? "success" : "secondary"} className="gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        shopifyStatus === "connected"
                          ? "bg-success"
                          : shopifyStatus === "connecting"
                            ? "bg-warning"
                            : "bg-muted-foreground"
                      }`}
                    />
                    Shopify {shopifyStatus === "connected" ? "connected" : "disconnected"}
                    {shopifyStatus === "connected" && shopDomain && (
                      <span className="text-xs text-muted-foreground">{shopDomain}</span>
                    )}
                  </Badge>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsLightMode((prev) => !prev)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-background/40 text-muted-foreground transition hover:text-foreground"
                title={isLightMode ? "Switch to dark mode" : "Switch to light mode"}
                aria-pressed={isLightMode}
              >
                {isLightMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>

              <Avatar className="h-12 w-12">
                <AvatarFallback>{user?.email?.slice(0, 2).toUpperCase() ?? "AG"}</AvatarFallback>
              </Avatar>
            </div>
          </header>
        )}

        <ShopifyConnectModal
          open={shopifyModalOpen}
          onOpenChange={setShopifyModalOpen}
          loading={shopifyStatus === "connecting"}
          initialValue={shopDomain}
          onSubmit={async (domain) => {
            await connectShopify(domain);
          }}
        />

        {disconnectTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
            <Card className="w-full max-w-md border border-white/10 bg-background/90 p-6 shadow-2xl">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">
                  {disconnectTarget === "meta" ? "Disconnect Meta?" : "Disconnect Shopify?"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  You can reconnect at any time from this header.
                </p>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setDisconnectTarget(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (disconnectTarget === "meta") {
                      await disconnectMeta();
                    } else {
                      await disconnectShopify();
                    }
                    setDisconnectTarget(null);
                  }}
                >
                  Disconnect
                </Button>
              </div>
            </Card>
          </div>
        )}

        <main
          className={[
            "flex-1 min-h-0 px-4 sm:px-6 lg:px-10",
            location.pathname === "/ai-chat" ? "overflow-hidden pt-6 pb-0" : "py-8 overflow-y-auto",
          ].join(" ")}
        >
          <div
            className={[
              "page-container mx-auto flex w-full flex-col gap-8",
              location.pathname === "/ai-chat"
                ? "max-w-none"
                : locale === "ar"
                  ? "max-w-[96%]"
                  : "max-w-7xl",
            ].join(" ")}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
