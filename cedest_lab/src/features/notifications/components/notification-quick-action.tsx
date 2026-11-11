"use client";

import * as React from "react";
import {
  CheckCircle2Icon,
  ChevronLeftIcon,
  Loader2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  quickAddLeadNoteAction,
  quickSetLeadStatusAction,
} from "../actions";

const STATUS_LABELS: Record<string, string> = {
  nouveau: "Nouveau",
  en_cours: "En cours",
  converti: "Converti",
  annule: "Annulé",
};

export function NotificationQuickAction({
  leadId,
  onBack,
}: {
  leadId: number;
  onBack: () => void;
}) {
  const [lead, setLead] = React.useState<{
    id: number;
    nom: string;
    type: string;
    status: string;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [status, setStatus] = React.useState("nouveau");
  const [note, setNote] = React.useState("");
  const [savingStatus, setSavingStatus] = React.useState(false);
  const [savingNote, setSavingNote] = React.useState(false);
  const [feedback, setFeedback] = React.useState<
    { tone: "ok" | "error"; text: string } | null
  >(null);

  React.useEffect(() => {
    let cancelled = false;

    getLeadContextAction({ id: leadId })
      .then((result) => {
        if (cancelled) return;
        if (result.ok) {
          setLead(result.lead);
          setStatus(result.lead.status);
        } else {
          setFeedback({ tone: "error", text: result.error });
        }
      })
      .catch((error) => {
        console.error("Contexte lead:", error);
        if (!cancelled) {
          setFeedback({
            tone: "error",
            text: "Impossible de charger la demande.",
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [leadId]);

  const handleSaveStatus = async () => {
    setSavingStatus(true);
    setFeedback(null);

    try {
      const result = await quickSetLeadStatusAction({ leadId, status });
      setFeedback(
        result.ok
          ? { tone: "ok", text: "Statut mis à jour." }
          : { tone: "error", text: result.error }
      );
      if (result.ok) {
        setLead((previous) =>
          previous ? { ...previous, status } : previous
        );
      }
    } catch (error) {
      console.error("Statut rapide:", error);
      setFeedback({ tone: "error", text: "L'enregistrement a échoué." });
    } finally {
      setSavingStatus(false);
    }
  };

  const handleSaveNote = async () => {
    setSavingNote(true);
    setFeedback(null);

    try {
      const result = await quickAddLeadNoteAction({ leadId, contenu: note });
      setFeedback(
        result.ok
          ? { tone: "ok", text: "Note ajoutée." }
          : { tone: "error", text: result.error }
      );
      if (result.ok) {
        setNote("");
      }
    } catch (error) {
      console.error("Note rapide:", error);
      setFeedback({ tone: "error", text: "L'ajout de la note a échoué." });
    } finally {
      setSavingNote(false);
    }
  };

  const busy = savingStatus || savingNote;

  return (
    <DrawerContent>
      <DrawerHeader className="flex-row items-center gap-2 p-3 pb-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onBack}
          aria-label="Retour au détail"
          className="size-11 shrink-0"
        >
          <ChevronLeftIcon />
        </Button>
        <div className="min-w-0 flex-1">
          <DrawerTitle className="truncate text-base">
            Action rapide
          </DrawerTitle>
          <DrawerDescription className="truncate">
            {lead
              ? `${lead.nom} — ${
                  LEAD_TYPE_SHORT_LABELS[
                    lead.type as keyof typeof LEAD_TYPE_SHORT_LABELS
                  ] ?? lead.type
                }`
              : "Demande"}
          </DrawerDescription>
        </div>
      </DrawerHeader>

      {loading ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <Loader2Icon
            className="size-6 animate-spin text-muted-foreground"
            aria-label="Chargement"
          />
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain p-4">
            <div className="space-y-1.5">
              <label
                htmlFor="quick-status"
                className="text-xs font-medium text-muted-foreground"
              >
                Statut de la demande
              </label>
              <select
                id="quick-status"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setFeedback(null);
                }}
                disabled={busy}
                className="h-11 w-full rounded-md border bg-background px-3 text-sm"
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                size="sm"
                className="h-9"
                onClick={handleSaveStatus}
                disabled={busy || (lead !== null && status === lead.status)}
              >
                {savingStatus ? (
                  <Loader2Icon className="animate-spin" aria-hidden />
                ) : (
                  <CheckCircle2Icon aria-hidden />
                )}
                Enregistrer le statut
              </Button>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="quick-note"
                className="text-xs font-medium text-muted-foreground"
              >
                Note interne
              </label>
              <Textarea
                id="quick-note"
                rows={3}
                value={note}
                onChange={(event) => {
                  setNote(event.target.value);
                  setFeedback(null);
                }}
                disabled={busy}
                placeholder="Visible uniquement par l'équipe"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9"
                onClick={handleSaveNote}
                disabled={busy || note.trim().length < 2}
              >
                {savingNote && (
                  <Loader2Icon className="animate-spin" aria-hidden />
                )}
                Ajouter la note
              </Button>
            </div>

            {feedback && (
              <p
                role={feedback.tone === "error" ? "alert" : "status"}
                className={
                  feedback.tone === "error"
                    ? "rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
                    : "rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400"
                }
              >
                {feedback.text}
              </p>
            )}
          </div>

          <DrawerFooter>
            <Button
              type="button"
              variant="ghost"
              className="h-11 w-full"
              onClick={onBack}
              disabled={busy}
            >
              Fermer
            </Button>
          </DrawerFooter>
        </>
      )}
    </DrawerContent>
  );
}
