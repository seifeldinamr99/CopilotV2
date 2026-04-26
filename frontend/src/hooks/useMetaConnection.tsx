import { useEffect, useState } from "react";
import { useMetaStore } from "@/store/meta-store";
import { useAuthStore } from "@/store/auth-store";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

async function getConnectUrl(accessToken: string): Promise<string> {
  const res = await fetch(`${API_BASE}/meta/connect-url`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const contentType = res.headers.get("content-type") ?? "";
    const details =
      contentType.includes("application/json")
        ? JSON.stringify(await res.json())
        : await res.text();
    throw new Error(`Failed to get Meta connect URL (${res.status}): ${details || res.statusText}`);
  }
  const data = (await res.json()) as { url?: string; persisted?: boolean };
  if (!data?.url) throw new Error("Missing connect URL");
  if (data.persisted === false) throw new Error("Meta connect isn't persisted; please retry.");
  return data.url;
}

async function fetchStatus(accessToken: string): Promise<{ connected: boolean }> {
  const res = await fetch(`${API_BASE}/meta/status`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  // If backend can't reach DB/Meta, treat as disconnected (avoid spamming UI errors on load).
  if (res.status === 503) return { connected: false };
  if (!res.ok) throw new Error(`Failed to fetch Meta status (${res.status})`);
  return (await res.json()) as { connected: boolean };
}

async function fetchAdAccounts(accessToken: string) {
  const res = await fetch(`${API_BASE}/meta/ad-accounts`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const details = await res.text();
    throw new Error(details || `Failed to fetch Meta ad accounts (${res.status})`);
  }
  return (await res.json()) as { profile?: { id: string; name: string }; adAccounts?: unknown };
}

export function useMetaConnection() {
  const hydrateFromStorage = useMetaStore((s) => s.hydrateFromStorage);
  const setConnectedPayload = useMetaStore((s) => s.setConnectedPayload);
  const setDisconnected = useMetaStore((s) => s.setDisconnected);
  const connected = useMetaStore((s) => s.connected);
  const session = useAuthStore((s) => s.session);

  const [status, setStatus] = useState<ConnectionStatus>(
    connected ? "connected" : "disconnected"
  );
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    const accessToken = session?.access_token;
    if (!accessToken) {
      // Ensure we don't show a cached "connected" state across logins.
      setDisconnected();
      return;
    }

    let canceled = false;

    (async () => {
      try {
        const status = await fetchStatus(accessToken);
        if (!status.connected) {
          if (!canceled) setDisconnected();
          return;
        }
        const data = await fetchAdAccounts(accessToken);
        if (!canceled && data?.profile && Array.isArray(data?.adAccounts)) {
          setConnectedPayload({
            profile: data.profile,
            adAccounts: data.adAccounts as any,
          });
          setLastSync("Just now");
        }
      } catch (e) {
        console.error(e);
      }
    })();

    return () => {
      canceled = true;
    };
  }, [session?.access_token, setConnectedPayload, setDisconnected]);

  useEffect(() => {
    setStatus(connected ? "connected" : "disconnected");
  }, [connected]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event?.data?.type === "META_AUTH_SUCCESS") {
        // We only treat the connection as "connected" if the backend reports persisted status.
        // Otherwise /api/meta/status and /api/meta/top-campaigns will fail with 409.
        const accessToken = session?.access_token;
        if (!accessToken) return;

        (async () => {
          try {
            const status = await fetchStatus(accessToken);
            if (!status.connected) {
              setDisconnected();
              setStatus("error");
              alert("Meta connection wasn't persisted. Please retry (backend database may be unavailable).");
              return;
            }
            const data = await fetchAdAccounts(accessToken);
            if (data?.profile && Array.isArray(data?.adAccounts)) {
              setConnectedPayload({
                profile: data.profile,
                adAccounts: data.adAccounts as any,
              });
            }
            setStatus("connected");
            setLastSync("Just now");
          } catch (e) {
            console.error(e);
            setStatus("error");
          }
        })();
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [session?.access_token, setConnectedPayload, setDisconnected]);

  const connect = async () => {
    setStatus("connecting");

    const accessToken = session?.access_token;
    if (!accessToken) {
      setStatus("error");
      alert("Please log in first.");
      return;
    }

    let url: string;
    try {
      url = await getConnectUrl(accessToken);
    } catch (e) {
      console.error(e);
      setStatus("error");
      alert(e instanceof Error ? e.message : "Failed to start Meta connection.");
      return;
    }

    const popup = window.open(url, "meta_oauth", "popup=yes,width=520,height=720");
    if (!popup) {
      setStatus("error");
      alert("Popup blocked. Please allow popups for localhost and try again.");
      return;
    }

    // Wait until popup closes or a success message arrives.
    try {
      await new Promise<void>((resolve, reject) => {
        const interval = window.setInterval(() => {
          if (popup.closed) {
            window.clearInterval(interval);
            window.removeEventListener("message", onMessage);
            // Ticket-based callback redirects to the frontend and writes to localStorage.
            // If we didn't receive a postMessage, attempt to hydrate and treat as success if connected.
            window.setTimeout(() => {
              hydrateFromStorage();
              if (useMetaStore.getState().connected) resolve();
              else reject(new Error("Popup closed"));
            }, 300);
          }
        }, 400);

        function onMessage(event: MessageEvent) {
          if (event?.data?.type === "META_AUTH_SUCCESS") {
            window.clearInterval(interval);
            window.removeEventListener("message", onMessage);
            resolve();
          }
        }

        window.addEventListener("message", onMessage);
      });

      setStatus("connected");
      setLastSync("Just now");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  const disconnect = async () => {
    const accessToken = session?.access_token;
    setDisconnected();
    setStatus("disconnected");
    setLastSync(null);
    if (!accessToken) return;
    try {
      await fetch(`${API_BASE}/meta/disconnect`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch (e) {
      console.error(e);
    }
  };

  return {
    status,
    connect,
    disconnect,
    lastSync,
  };
}
