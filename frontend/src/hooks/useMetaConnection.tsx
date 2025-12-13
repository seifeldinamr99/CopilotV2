import { useState } from "react";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export function useMetaConnection() {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [lastSync, setLastSync] = useState<string | null>(null);

  const connect = async () => {
    setStatus("connecting");
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setStatus("connected");
      setLastSync("Just now");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return {
    status,
    connect,
    lastSync,
  };
}
