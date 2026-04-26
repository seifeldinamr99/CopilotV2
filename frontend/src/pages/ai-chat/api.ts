const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export async function fetchSessions(accessToken: string) {
  const res = await fetch(`${API_BASE}/ai-chat/sessions`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const details = await res.text();
    throw new Error(details || `Failed to load chat sessions (${res.status})`);
  }
  return res.json();
}

export async function fetchMessages(accessToken: string, sessionId: string) {
  const res = await fetch(`${API_BASE}/ai-chat/sessions/${sessionId}/messages`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const details = await res.text();
    throw new Error(details || `Failed to load messages (${res.status})`);
  }
  return res.json();
}

export async function createSession(accessToken: string, title: string) {
  const res = await fetch(`${API_BASE}/ai-chat/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) {
    const details = await res.text();
    throw new Error(details || `Failed to create session (${res.status})`);
  }
  return res.json();
}

export async function deleteSession(accessToken: string, sessionId: string) {
  const res = await fetch(`${API_BASE}/ai-chat/sessions/${sessionId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const details = await res.text();
    throw new Error(details || `Failed to delete session (${res.status})`);
  }
}

export async function sendChat(accessToken: string, sessionId: string, message: string) {
  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sessionId, message }),
  });
  if (!res.ok) {
    const details = await res.text();
    throw new Error(details || `Failed to send message (${res.status})`);
  }
  return res.json();
}
