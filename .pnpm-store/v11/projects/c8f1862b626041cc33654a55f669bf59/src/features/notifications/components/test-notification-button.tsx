"use client";

import * as React from "react";
import { BellRingIcon, CheckCircle2Icon, Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { sendTestNotificationAction } from "../actions";
import { cn } from "@/lib/utils";

/**
 * « Envoyer une notification de test » — visible au gérant uniquement
 * (la page Paramètres est déjà réservée à ce rôle).
 *
 * La notification est créée pour l'appelant : c'est le parcours complet
 * qui est vérifié (toast → badge → drawer → détail).
 */
export function TestNotificationButton() {
  const [feedback, setFeedback] = React.useState<
    { tone: "ok" | "error"; text: string } | null
  >(null);
  const [isPending, startTransition] = React.useTransition();

  const sendTest = () => {
    setFeedback(null);

    startTransition(async () => {
      try {
        const result = await sendTestNotificationAction();

        setFeedback(
          result.ok
            ? {
                tone: "ok",
                text: "Notification de test envoyée. Regardez la cloche en haut à droite.",
              }
            : { tone: "error", text: "L'envoi a échoué. Réessayez." }
        );
      } catch (error) {
        console.error("Notification de test:", error);
        setFeedback({ tone: "error", text: "L'envoi a échoué. Réessayez." });
      }
    });
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="h-11"
        onClick={sendTest}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2Icon className="animate-spin" aria-hidden />
        ) : (
          <BellRingIcon aria-hidden />
        )}
        Envoyer une notification de test
      </Button>

      {feedback && (
        <p
          role={feedback.tone === "error" ? "alert" : "status"}
          className={cn(
            "flex items-start gap-2 rounded-lg px-3 py-2 text-sm",
            feedback.tone === "error"
              ? "bg-destructive/10 text-destructive"
              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          )}
        >
          {feedback.tone === "ok" && (
            <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
          )}
          {feedback.text}
        </p>
      )}
    </div>
  );
}
