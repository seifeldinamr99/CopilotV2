import { create } from "zustand";

export type MetaAdAccount = {
  id: string;
  name: string;
  account_id?: string;
  currency?: string;
  timezone_name?: string;
};

export type MetaProfile = {
  id: string;
  name: string;
};

type MetaState = {
  connected: boolean;
  profile: MetaProfile | null;
  adAccounts: MetaAdAccount[];
  selectedAdAccountId: string | null;
  setConnectedPayload: (payload: {
    profile: MetaProfile;
    adAccounts: MetaAdAccount[];
  }) => void;
  setDisconnected: () => void;
  setSelectedAdAccountId: (id: string) => void;
  hydrateFromStorage: () => void;
};

const STORAGE_KEY = "meta_connection_v1";

function load(): Partial<Pick<MetaState, "connected" | "profile" | "adAccounts" | "selectedAdAccountId">> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function save(state: Pick<MetaState, "connected" | "profile" | "adAccounts" | "selectedAdAccountId">) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function clear() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export const useMetaStore = create<MetaState>((set, get) => ({
  connected: false,
  profile: null,
  adAccounts: [],
  selectedAdAccountId: null,

  hydrateFromStorage: () => {
    const stored = load();
    set(() => ({
      connected: Boolean(stored.connected),
      profile: stored.profile ?? null,
      adAccounts: stored.adAccounts ?? [],
      selectedAdAccountId: stored.selectedAdAccountId ?? null,
    }));
  },

  setConnectedPayload: ({ profile, adAccounts }) => {
    const selected = get().selectedAdAccountId ?? (adAccounts[0]?.id ?? null);
    const next = {
      connected: true,
      profile,
      adAccounts,
      selectedAdAccountId: selected,
    };
    set(() => next);
    save(next);
  },

  setDisconnected: () => {
    const next = { connected: false, profile: null, adAccounts: [], selectedAdAccountId: null };
    set(() => next);
    clear();
  },

  setSelectedAdAccountId: (id) => {
    const next = {
      connected: get().connected,
      profile: get().profile,
      adAccounts: get().adAccounts,
      selectedAdAccountId: id,
    };
    set(() => ({ selectedAdAccountId: id }));
    save(next);
  },
}));
