import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { HistoryItem } from "@/lib/studio";

const MAX_ITEMS = 40;

interface HistoryState {
  items: HistoryItem[];
  add: (item: HistoryItem) => void;
  remove: (id: string) => void;
  get: (id: string) => HistoryItem | undefined;
  clear: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) =>
        set((state) => ({
          items: [item, ...state.items.filter((x) => x.id !== item.id)].slice(
            0,
            MAX_ITEMS,
          ),
        })),
      remove: (id) =>
        set((state) => ({ items: state.items.filter((x) => x.id !== id) })),
      get: (id) => get().items.find((x) => x.id === id),
      clear: () => set({ items: [] }),
    }),
    { name: "promptreel-history", skipHydration: true },
  ),
);

export function useHistoryHydration() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    void Promise.resolve(useHistoryStore.persist.rehydrate()).then(() =>
      setHydrated(true),
    );
  }, []);
  return hydrated;
}
