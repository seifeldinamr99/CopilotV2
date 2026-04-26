import { create } from "zustand";

export type ShopifyState = {
  connected: boolean;
  shopDomain: string | null;
  lastSync: string | null;
  setConnected: (payload: { shopDomain: string; lastSync?: string | null }) => void;
  setDisconnected: () => void;
};

export const useShopifyStore = create<ShopifyState>((set) => ({
  connected: false,
  shopDomain: null,
  lastSync: null,
  setConnected: ({ shopDomain, lastSync }) =>
    set(() => ({ connected: true, shopDomain, lastSync: lastSync ?? "Just now" })),
  setDisconnected: () => set(() => ({ connected: false, shopDomain: null, lastSync: null })),
}));

