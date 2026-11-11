"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ExternalLinkIcon,
  Loader2Icon,
  MessageCircleIcon,
  Trash2Icon,
  ZapIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { LEAD_TYPE_SHORT_LABELS } from "../catalog";
import {
  getLeadContextAction,
} from "../actions";
import {
  formatDateLongueIso,
  formatHeureKinshasa,
  getKinshasaDateIso,
} from "@/lib/time";
import { buildWhatsAppLink } from "@/src/lib/whatsapp";
import type { NotificationItem } from "../types";

type LeadContext = {
  id: number;
  nom: string;
  telephone: string;
  type: string;
  status: string;
};

export function NotificationDetail({
  notification,
  onBack,
  onDelete,
  onOpenQuickAction,
  onNavigate,
}: {
  notification: NotificationItem | null;
  onBack: () => void;
  onDelete: (notification: NotificationItem) => void;
  onOpenQuickAction: (leadId: number) => void;
  /** Quitte le drawer pour une navigation interne. */
  onNavigate: () => void;
}) {
  const router = useRouter();
  const [leadState, setLeadState] = React.useState<{
    forId: number;
    lead: LeadContext | null;
  } | null>(null);

  const rawLeadId =
    notification?.entiteType === "lead" && notification.entiteId
      ? Number(notification.entiteId)
      : null;
  const leadId =
    rawLeadId !== null && Number.isInteger(rawLeadId) && rawLeadId > 0
      ? rawLeadId
      : null;

  React.useEffect(() => {
    if (leadId === null) return;

    let cancelled = false;

    getLeadContextAction({ id: leadId })
      .then((result) => {
        if (cancelled) return;
        setLeadState({ forId: leadId, lead: result.ok ? result.lead : null });
      })
      .catch((error) => {
        console.error("Contexte lead:", error);
        if (!cancelled) setLeadState({ forId: leadId, lead: null });
      });

    return () => {
      cancelled = true;
    };
  }, [leadId]);

  const lead = leadState?.forId === leadId ? leadState.lead : null;
  const leadLoading = leadId !== null && leadState?.forId !== leadId;

  const isDemand = notification?.entiteType === "lead";
  const isHighPriority = notification?.priorite === "haute";

  const whatsappHref =
    lead?.telephone && notification
      ? buildWhatsAppLink(
          lead.telephone,
          `Bonjour ${lead.nom}, ici Cyber Cedest. Nous avons bien reçu votre demande (${
            LEAD_TYPE_SHORT_LABELS[
              lead.type as keyof typeof LEAD_TYPE_SHORT_LABELS
            ] ?? lead.type
          }). Nous vous recontactons rapidement. À très vite.`
        )
      : null;

  const createdAt = notification ? new Date(notification.createdAtIso) : null;

  return (
    <DrawerContent>
      <DrawerHeader className="flex-row items-center gap-2 p-3 pb-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onBack}
          aria-label="Retour à la liste"
          className="size-11 shrink-0"
        >
          <ChevronLeftIcon />
        </Button>
        <DrawerTitle className="min-w-0 flex-1 truncate text-base">
          {notification?.titre ?? "Détail"}
        </DrawerTitle>
      </DrawerHeader>

      <DrawerDescription className="sr-only">
        Détail de la notification
      </DrawerDescription>

      {notification ? (
        <>
          <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{notification.typeLabel}</Badge>
              {isHighPriority && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangleIcon aria-hidden />
                  Priorité haute
                </Badge>
              )}
            </div>

            <p className="text-sm leading-relaxed">{notification.corps}</p>

            <dl className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 font-medium">Date</dt>
                <dd>
                  {createdAt
                    ? `${formatDateLongueIso(
                        getKinshasaDateIso(createdAt)
                      )} à ${formatHeureKinshasa(createdAt)}`
                    : "—"}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 font-medium">Site</dt>
                <dd>{notification.siteNom ?? "Tous les sites"}</dd>
              </div>
            </dl>

            <div className="space-y-2 border-t pt-4">
              {isDemand && (
                <>
                  {notification.href && (
                    <Button
                      type="button"
                      className="h-11 w-full justify-between"
                      onClick={() => {
                        onNavigate();
                        router.push(notification.href!);
                      }}
                    >
                      Voir la demande
                      <ArrowRightIcon aria-hidden />
                    </Button>
                  )}
                  {leadLoading ? (
                    <p className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
                      <Loader2Icon className="size-4 animate-spin" aria-hidden />
                      Chargement de la demande…
                    </p>
                  ) : (
                    <>
                      {whatsappHref && (
                        <Button
                          type="button"
                          variant="outline"
                          className="h-11 w-full justify-between"
                          render={
                            <a
                              href={whatsappHref}
                              target="_blank"
                              rel="noreferrer noopener"
                            />
                          }
                        >
                          Répondre sur WhatsApp
                          <MessageCircleIcon aria-hidden />
                        </Button>
                      )}
                      {lead && (
                        <Button
                          type="button"
                          variant="secondary"
                          className="h-11 w-full justify-between"
                          onClick={() => onOpenQuickAction(lead.id)}
                        >
                          Action rapide (statut, note)
                          <ZapIcon aria-hidden />
                        </Button>
                      )}
                    </>
                  )}
                </>
              )}

              {!isDemand && notification.href && (
                <Button
                  type="button"
                  className="h-11 w-full justify-between"
                  onClick={() => {
                    onNavigate();
                    router.push(notification.href!);
                  }}
                >
                  {notification.type === "pointage_validation"
                    ? "Corriger ou valider"
                    : notification.type === "caisse_non_saisie"
                      ? "Saisir la caisse"
                      : "Ouvrir la page"}
                  <ExternalLinkIcon aria-hidden />
                </Button>
              )}
            </div>
          </div>

          <DrawerFooter>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full text-destructive hover:text-destructive"
              onClick={() => onDelete(notification)}
            >
              <Trash2Icon aria-hidden />
              Supprimer la notification
            </Button>
          </DrawerFooter>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center p-6">
          <Loader2Icon
            className="size-6 animate-spin text-muted-foreground"
            aria-label="Chargement"
          />
        </div>
      )}
    </DrawerContent>
  );
}
