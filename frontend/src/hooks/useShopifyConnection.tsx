import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useShopifyStore } from "@/store/shopify-store";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

async function fetchShopifyStatus(accessToken: string) {
  const res = await fetch(`${API_BASE}/shopify/status`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 503) return { connected: false } as { connected: boolean; shopDomain?: string };
  if (!res.ok) throw new Error(`Failed to fetch Shopify status (${res.status})`);
  return (await res.json()) as { connected: boolean; shopDomain?: string };
}

async function getShopifyConnectUrl(accessToken: string, shopDomain: string) {
  const res = await fetch(`${API_BASE}/shopify/connect-url`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ shopDomain }),
  });
  if (!res.ok) {
    const contentType = res.headers.get("content-type") ?? "";
    const details =
      contentType.includes("application/json")
        ? JSON.stringify(await res.json())
        : await res.text();
    throw new Error(`Failed to get Shopify connect URL (${res.status}): ${details || res.statusText}`);
  }
  const data = (await res.json()) as { url?: string };
  if (!data?.url) throw new Error("Missing connect URL");
  return data.url;
}

export function useShopifyConnection() {
  const session = useAuthStore((s) => s.session);
  const setConnected = useShopifyStore((s) => s.setConnected);
  const setDisconnected = useShopifyStore((s) => s.setDisconnected);
  const connected = useShopifyStore((s) => s.connected);
  const shopDomain = useShopifyStore((s) => s.shopDomain);
  const lastSync = useShopifyStore((s) => s.lastSync);

  const [status, setStatus] = useState<ConnectionStatus>(connected ? "connected" : "disconnected");

  useEffect(() => {
    setStatus(connected ? "connected" : "disconnected");
  }, [connected]);

  useEffect(() => {
    const accessToken = session?.access_token;
    if (!accessToken) {
      setDisconnected();
      return;
    }

    let canceled = false;
    (async () => {
      try {
        const st = await fetchShopifyStatus(accessToken);
        if (canceled) return;
        if (!st.connected || !st.shopDomain) {
          setDisconnected();
          return;
        }
        setConnected({ shopDomain: st.shopDomain, lastSync: "Just now" });
      } catch (e) {
        console.error(e);
      }
    })();

    return () => {
      canceled = true;
    };
  }, [session?.access_token, setConnected, setDisconnected]);

  const connect = async (rawShopDomain: string) => {
    setStatus("connecting");

    const accessToken = session?.access_token;
    if (!accessToken) {
      setStatus("error");
      alert("Please log in first.");
      return;
    }

    const raw = rawShopDomain.trim();
    if (!raw) return;

    let url: string;
    try {
      url = await getShopifyConnectUrl(accessToken, raw);
    } catch (e) {
      console.error(e);
      setStatus("error");
      alert(e instanceof Error ? e.message : "Failed to start Shopify connection.");
      return;
    }

    const popup = window.open(url, "shopify_oauth", "popup=yes,width=520,height=720");
    if (!popup) {
      setStatus("error");
      alert("Popup blocked. Please allow popups for localhost and try again.");
      return;
    }

    try {
      await new Promise<void>((resolve, reject) => {
        function onMessage(event: MessageEvent) {
          if (event?.data?.type === "SHOPIFY_AUTH_SUCCESS") {
            window.clearInterval(interval);
            window.removeEventListener("message", onMessage);
            resolve();
          }
        }

        const interval = window.setInterval(() => {
          if (popup.closed) {
            window.clearInterval(interval);
            window.removeEventListener("message", onMessage);
            // After popup closes, poll status once.
            window.setTimeout(async () => {
              try {
                const st = await fetchShopifyStatus(accessToken);
                if (st.connected && st.shopDomain) resolve();
                else reject(new Error("Not connected"));
              } catch (e) {
                reject(e);
              }
            }, 300);
          }
        }, 400);

        window.addEventListener("message", onMessage);
      });

      const st = await fetchShopifyStatus(accessToken);
      if (st.connected && st.shopDomain) {
        setConnected({ shopDomain: st.shopDomain, lastSync: "Just now" });
        setStatus("connected");
      } else {
        setDisconnected();
        setStatus("error");
      }
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  const disconnect = async () => {
    const accessToken = session?.access_token;
    setDisconnected();
    setStatus("disconnected");
    if (!accessToken) return;
    try {
      await fetch(`${API_BASE}/shopify/disconnect`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch (e) {
      console.error(e);
    }
  };

  return { status, connect, disconnect, lastSync, shopDomain };
}
