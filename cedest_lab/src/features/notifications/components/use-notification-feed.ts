"use client";

import * as React from "react";

import type { NotificationFeed, NotificationItem } from "../types";

const BASE_INTERVAL_MS = 30_000;
const MAX_INTERVAL_MS = 5 * 60_000;

export type UseNotificationFeedResult = {
  /** Nombre de notifications non lues (pour le badge). */
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
};

/**
 * Polling léger du flux de notifications (`GET /api/notifications`).
 *
 * - ~30 s d'intervalle, basé sur setTimeout (pas de requête concurrente) ;
 * - aucune requête quand `document.visibilityState === "hidden"` ;
 * - rafraîchissement immédiat au retour sur l'onglet ;
 * - attente doublée après chaque erreur réseau (30 s → 60 s → … → 5 min),
 *   remise à 30 s après un succès.
 *
 * Le hook est isolé : l'interface n'en dépend que via ce contrat et peut
 * être remplacée plus tard par du SSE sans changer le composant.
 */
export function useNotificationFeed(options?: {
  onNewItems?: (items: NotificationItem[]) => void;
}): UseNotificationFeedResult {
  const onNewItems = options?.onNewItems;
  const onNewItemsRef = React.useRef(onNewItems);

  React.useEffect(() => {
    onNewItemsRef.current = onNewItems;
  });

  const [unreadCount, setUnreadCount] = React.useState(0);
  const cursorRef = React.useRef<string | null>(null);
  const backoffRef = React.useRef(BASE_INTERVAL_MS);
  const timerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const clearTimer = () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const schedule = () => {
      clearTimer();
      timerRef.current = window.setTimeout(tick, backoffRef.current);
    };

    const tick = async () => {
      if (document.visibilityState === "hidden") {
        schedule();
        return;
      }

      try {
        const url = `/api/notifications?since=${encodeURIComponent(
          cursorRef.current ?? ""
        )}`;
        const response = await fetch(url, {
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Flux notifications : ${response.status}`);
        }

        const data = (await response.json()) as NotificationFeed;
        if (cancelled) return;

        backoffRef.current = BASE_INTERVAL_MS;
        setUnreadCount(data.unreadCount);

        // Toaste uniquement les arrivées postérieures au chargement initial.
        if (cursorRef.current !== null && data.items.length > 0) {
          onNewItemsRef.current?.(data.items);
        }

        cursorRef.current = data.cursor;
      } catch (error) {
        console.error("Polling notifications interrompu:", error);
        if (!cancelled) {
          backoffRef.current = Math.min(
            backoffRef.current * 2,
            MAX_INTERVAL_MS
          );
        }
      }

      if (!cancelled) schedule();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        clearTimer();
        void tick();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    void tick();

    return () => {
      cancelled = true;
      clearTimer();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
    // Le flux tourne une fois par page, à vie.
  }, []);

  return { unreadCount, setUnreadCount };
}
