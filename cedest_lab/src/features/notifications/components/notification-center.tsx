"use client";

import * as React from "react";
import { BellIcon, CheckCheckIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { toast } from "@/components/ui/toast";
import {
  deleteNotificationAction,
  getNotificationAction,
  listNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "../actions";
import {
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPES,
  type NotificationItem,
  type NotificationTypeFilter,
} from "../types";
import { NotificationList } from "./notification-list";
import { NotificationDetail } from "./notification-detail";
import { NotificationQuickAction } from "./notification-quick-action";
import { useNotificationFeed } from "./use-notification-feed";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

export function NotificationCenter() {
  const [listOpen, setListOpen] = React.useState(false);
  const [items, setItems] = React.useState<NotificationItem[]>([]);
  const [nextCursor, setNextCursor] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [tab, setTab] = React.useState<"all" | "unread">("all");
  const [typeFilter, setTypeFilter] = React.useState<NotificationTypeFilter>(
    "all"
  );

  const [detailOpen, setDetailOpen] = React.useState(false);
  const [quickOpen, setQuickOpen] = React.useState(false);
  const [quickLeadId, setQuickLeadId] = React.useState<number | null>(null);
  const [selected, setSelected] = React.useState<NotificationItem | null>(
    null
  );

  async function loadInitial(
    tabArg: "all" | "unread",
    typeArg: NotificationTypeFilter
  ) {
    setLoading(true);

    try {
      const result = await listNotificationsAction({
        tab: tabArg,
        type: typeArg,
        cursor: null,
        limit: PAGE_SIZE,
      });

      if (result.ok) {
        setItems(result.items);
        setNextCursor(result.nextCursor);
      }
    } catch (error) {
      console.error("Chargement notifications:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (!nextCursor || loading) return;
    setLoading(true);

    try {
      const result = await listNotificationsAction({
        tab,
        type: typeFilter,
        cursor: nextCursor,
        limit: PAGE_SIZE,
      });

      if (result.ok) {
        setItems((previous) => [...previous, ...result.items]);
        setNextCursor(result.nextCursor);
      }
    } catch (error) {
      console.error("Chargement notifications:", error);
    } finally {
      setLoading(false);
    }
  }

  async function markRead(id: number) {
    try {
      const result = await markNotificationReadAction({ id });

      if (result.ok) {
        setItems((previous) =>
          previous.map((item) =>
            item.id === id ? { ...item, lu: true } : item
          )
        );

        if (result.changed) {
          feed.setUnreadCount((count) => Math.max(0, count - 1));
        }
      }
    } catch (error) {
      console.error("Marquer comme lu:", error);
    }
  }

  async function openDetail(id: number) {
    setDetailOpen(true);
    setQuickOpen(false);
    setSelected(null);

    try {
      const result = await getNotificationAction({ id });

      if (result.ok && result.notification) {
        setSelected(result.notification);
        void markRead(result.notification.id);
      } else {
        setDetailOpen(false);
      }
    } catch (error) {
      console.error("Ouvrir notification:", error);
      setDetailOpen(false);
    }
  }

  async function handleDelete(notification: NotificationItem) {
    try {
      const result = await deleteNotificationAction({ id: notification.id });
      if (!result.ok) return;

      setItems((previous) =>
        previous.filter((item) => item.id !== notification.id)
      );

      if (!notification.lu) {
        feed.setUnreadCount((count) => Math.max(0, count - 1));
      }

      if (selected?.id === notification.id) {
        setDetailOpen(false);
        setQuickOpen(false);
        setSelected(null);
      }
    } catch (error) {
      console.error("Supprimer notification:", error);
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsReadAction();
      setItems((previous) => previous.map((item) => ({ ...item, lu: true })));
      feed.setUnreadCount(0);
    } catch (error) {
      console.error("Tout marquer comme lu:", error);
    }
  }

  const toastedIdsRef = React.useRef(new Set<number>());

  function showToasts(fresh: NotificationItem[]) {
    // Défense en profondeur : jamais deux toasts pour la même notification
    // pendant une session (le curseur côté serveur avance aussi).
    const pending = fresh.filter((item) => {
      if (toastedIdsRef.current.has(item.id)) return false;
      toastedIdsRef.current.add(item.id);
      return true;
    });

    if (pending.length === 0) return;

    const total = pending.length;

    if (total > 3) {
      toast.add({
        title: `${total} nouvelles notifications`,
        description: "Ouvrez le centre pour les voir toutes.",
        type: "info",
        timeout: 6_000,
        actionProps: {
          children: "Voir",
          onClick: () => {
            setListOpen(true);
            void loadInitial("all", "all");
          },
        },
      });
      return;
    }

    for (const notification of pending) {
      const high = notification.priorite === "haute";

      toast.add({
        id: `notif-${notification.id}`,
        title: notification.titre,
        description: notification.corps,
        type: high ? "warning" : "info",
        timeout: high ? 10_000 : 6_000,
        priority: high ? "high" : "low",
        actionProps: {
          children: "Voir",
          onClick: () => {
            void openDetail(notification.id);
          },
        },
      });
    }
  }

  function handleNewItems(fresh: NotificationItem[]) {
    setItems((previous) =>
      listOpen
        ? [
            ...fresh.filter(
              (item) => !previous.some((p) => p.id === item.id)
            ),
            ...previous,
          ]
        : previous
    );

    showToasts(fresh);
  }

  const feed = useNotificationFeed({ onNewItems: handleNewItems });
  const { unreadCount } = feed;

  function toggleList() {
    if (listOpen) {
      setListOpen(false);
      return;
    }

    setListOpen(true);
    void loadInitial(tab, typeFilter);
  }

  function handleTabChange(next: "all" | "unread") {
    setTab(next);
    void loadInitial(next, typeFilter);
  }

  function handleTypeChange(next: NotificationTypeFilter) {
    setTypeFilter(next);
    void loadInitial(tab, next);
  }

  function closeAll() {
    setQuickOpen(false);
    setDetailOpen(false);
    setListOpen(false);
  }

  const badgeLabel =
    unreadCount === 0
      ? "Notifications"
      : unreadCount === 1
        ? "1 notification non lue"
        : `${unreadCount} notifications non lues`;

  return (
    <>
      <button
        type="button"
        onClick={toggleList}
        aria-label={badgeLabel}
        aria-expanded={listOpen}
        className="relative flex size-11 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <BellIcon className="size-5" aria-hidden />
        {unreadCount > 0 && (
          <span
            aria-hidden
            className="absolute top-1 right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none font-semibold text-destructive-foreground"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <Drawer
        open={listOpen}
        onOpenChange={(open) => {
          // Échap / clic dehors : ne fermer la liste que si le détail est fermé.
          if (open) setListOpen(true);
          else if (!detailOpen) setListOpen(false);
        }}
        swipeDirection="right"
      >
        <DrawerContent className="data-[swipe-axis=x]:[--drawer-content-width:100%] data-[swipe-axis=x]:sm:[--drawer-content-width:24rem]">
          <DrawerHeader className="gap-2 border-b p-3">
            <div className="flex items-center justify-between gap-2">
              <DrawerTitle className="text-lg">Notifications</DrawerTitle>
              <DrawerClose
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-11"
                    aria-label="Fermer"
                  >
                    <XIcon />
                  </Button>
                }
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div
                className="flex rounded-lg border p-0.5"
                role="group"
                aria-label="Filtrer les notifications"
              >
                {(
                  [
                    { value: "all", label: "Toutes" },
                    { value: "unread", label: "Non lues" },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={tab === option.value}
                    onClick={() => handleTabChange(option.value)}
                    className={cn(
                      "h-9 rounded-md px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      tab === option.value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <select
                value={typeFilter}
                onChange={(event) =>
                  handleTypeChange(
                    event.target.value as NotificationTypeFilter
                  )
                }
                aria-label="Filtrer par type"
                className="h-9 rounded-md border bg-background px-2 text-xs"
              >
                <option value="all">Tous les types</option>
                {NOTIFICATION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {NOTIFICATION_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-auto h-9 gap-1.5 text-xs"
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
              >
                <CheckCheckIcon className="size-3.5" aria-hidden />
                Tout marquer comme lu
              </Button>
            </div>
          </DrawerHeader>

          <NotificationList
            items={items}
            loading={loading}
            onOpen={(notification) => void openDetail(notification.id)}
            onDelete={(notification) => void handleDelete(notification)}
          />

          {nextCursor && items.length > 0 && (
            <div className="border-t p-2">
              <Button
                type="button"
                variant="ghost"
                className="h-11 w-full"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? "Chargement…" : "Voir plus"}
              </Button>
            </div>
          )}

          {/* Niveau 2 — détail */}
          <Drawer
            open={detailOpen}
            onOpenChange={(open) => {
              if (open) setDetailOpen(true);
              else if (!quickOpen) {
                setDetailOpen(false);
                setQuickOpen(false);
              }
            }}
            swipeDirection="right"
          >
            <NotificationDetail
              notification={selected}
              onBack={() => {
                setDetailOpen(false);
                setQuickOpen(false);
              }}
              onDelete={(notification) => void handleDelete(notification)}
              onOpenQuickAction={(leadId) => {
                setQuickLeadId(leadId);
                setQuickOpen(true);
              }}
              onNavigate={closeAll}
            />

            {/* Niveau 3 — action rapide */}
            <Drawer
              open={quickOpen}
              onOpenChange={(open) => {
                if (open) setQuickOpen(true);
                else setQuickOpen(false);
              }}
              swipeDirection="right"
            >
              {quickLeadId !== null && (
                <NotificationQuickAction
                  leadId={quickLeadId}
                  onBack={() => setQuickOpen(false)}
                />
              )}
            </Drawer>
          </Drawer>
        </DrawerContent>
      </Drawer>
    </>
  );
}
