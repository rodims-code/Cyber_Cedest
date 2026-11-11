"use client";

import * as React from "react";
import { BellOffIcon, ChevronRightIcon, Trash2Icon } from "lucide-react";

import { kinshasaDayLabel, formatRelativeTime } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { NotificationItem } from "../types";

const GROUP_ORDER = ["Aujourd'hui", "Hier", "Plus ancien"] as const;
type GroupLabel = (typeof GROUP_ORDER)[number];

export function NotificationList({
  items,
  loading,
  onOpen,
  onDelete,
}: {
  items: NotificationItem[];
  loading: boolean;
  onOpen: (notification: NotificationItem) => void;
  onDelete: (notification: NotificationItem) => void;
}) {
  const groups = React.useMemo(() => {
    const byGroup = new Map<GroupLabel, NotificationItem[]>();

    for (const item of items) {
      const label = kinshasaDayLabel(item.createdAtIso) as GroupLabel;
      const bucket = byGroup.get(label) ?? [];
      bucket.push(item);
      byGroup.set(label, bucket);
    }

    return GROUP_ORDER.filter((label) => byGroup.has(label)).map((label) => ({
      label,
      items: byGroup.get(label)!,
    }));
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-14 text-center">
        <BellOffIcon className="size-8 text-muted-foreground/50" aria-hidden />
        <p className="text-sm text-muted-foreground">
          {loading
            ? "Chargement…"
            : "Aucune notification. Tout est à jour."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain pb-2">
      {groups.map((group) => (
        <section key={group.label} aria-label={group.label}>
          <h3 className="px-4 pt-3 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            {group.label}
          </h3>
          <ul className="space-y-0.5 px-1.5">
            {group.items.map((notification) => (
              <li key={notification.id} className="flex items-stretch">
                <button
                  type="button"
                  onClick={() => onOpen(notification)}
                  className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      notification.lu ? "bg-transparent" : "bg-blue-500"
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate text-sm",
                        notification.lu ? "font-normal" : "font-medium"
                      )}
                    >
                      {notification.titre}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {notification.corps}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-muted-foreground">
                      {formatRelativeTime(notification.createdAtIso)}
                      {notification.siteNom ? ` · ${notification.siteNom}` : ""}
                    </span>
                  </span>
                  <ChevronRightIcon
                    className="size-4 shrink-0 text-muted-foreground/60"
                    aria-hidden
                  />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(notification)}
                  aria-label="Supprimer la notification"
                  className="flex w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Trash2Icon className="size-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
