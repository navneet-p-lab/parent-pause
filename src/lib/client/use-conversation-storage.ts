"use client";

import { useEffect, useState, useSyncExternalStore, type Dispatch } from "react";
import { HISTORY_STORAGE_KEY, restoreConversation, serializeConversation } from "./conversation-storage";
import type { ConversationAction, ConversationState } from "./conversation-reducer";

type Notice = "unavailable" | "invalid" | "conflict" | "delete-failed" | null;
const serverSnapshot: { ready: boolean; notice: Notice } = { ready: false, notice: null };

// Storage is an external system. Publish its status through a subscription so
// server rendering stays deterministic and failed writes never discard UI state.
function createStorageSession() {
  let snapshot = serverSnapshot;
  let lastRaw: string | null = null;
  let blocked = false;
  const listeners = new Set<() => void>();
  function publish(notice: Notice) {
    if (snapshot.ready && snapshot.notice === notice) return;
    snapshot = { ready: true, notice };
    listeners.forEach((listener) => listener());
  }
  return {
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    getSnapshot: () => snapshot,
    load(dispatch: Dispatch<ConversationAction>) {
      if (snapshot.ready) return;
      try {
        lastRaw = localStorage.getItem(HISTORY_STORAGE_KEY);
        try { dispatch({ type: "restore", state: restoreConversation(lastRaw) }); }
        catch { blocked = true; publish("invalid"); return; }
        publish(null);
      } catch { blocked = true; publish("unavailable"); }
    },
    detectConflict() {
      if (blocked) return;
      try {
        if (localStorage.getItem(HISTORY_STORAGE_KEY) !== lastRaw) { blocked = true; publish("conflict"); }
      } catch { blocked = true; publish("unavailable"); }
    },
    save(state: ConversationState) {
      if (!snapshot.ready || blocked) return;
      this.detectConflict();
      if (blocked) return;
      try {
        const raw = serializeConversation(state);
        if (raw === lastRaw) return;
        if (raw === null) localStorage.removeItem(HISTORY_STORAGE_KEY);
        else localStorage.setItem(HISTORY_STORAGE_KEY, raw);
        lastRaw = raw;
        publish(null);
      } catch { publish("unavailable"); }
    },
    clearSaved() {
      try {
        localStorage.removeItem(HISTORY_STORAGE_KEY);
        lastRaw = null; blocked = false; publish(null);
      } catch { blocked = true; publish("delete-failed"); }
    },
  };
}

export function useConversationStorage(state: ConversationState, dispatch: Dispatch<ConversationAction>) {
  const [session] = useState(createStorageSession);
  const { ready, notice } = useSyncExternalStore(session.subscribe, session.getSnapshot, () => serverSnapshot);
  useEffect(() => {
    session.load(dispatch);
    const onStorage = (event: StorageEvent) => {
      if (event.key === HISTORY_STORAGE_KEY || event.key === null) session.detectConflict();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [session, dispatch]);
  useEffect(() => { if (ready) session.save(state); }, [ready, session, state]);
  return { ready, notice, clearSaved() { session.clearSaved(); dispatch({ type: "clear-all" }); } };
}
