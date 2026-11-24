"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { GraduationCap } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { cn } from "@/lib/utils";
import type { LeadFormInitialData } from "./lead-form-dialog";

// Chargé uniquement à l'ouverture (Phase 3 règle 1)
const LeadFormDialog = dynamic(
  () => import("./lead-form-dialog").then((mod) => mod.LeadFormDialog),
  { ssr: false }
);

interface FormationCardActionsProps {
  formationId: string;
  formationTitle: string;
  activeFilter: string; // "all" | "presentiel" | "en_ligne"
}

export function FormationCardActions({
  formationId,
  formationTitle,
  activeFilter,
}: FormationCardActionsProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const mapFormationId = (): "initiation" | "word" | "excel" | "powerpoint" | "internet" | "conseil" => {
    if (formationId.includes("word")) return "word";
    if (formationId.includes("excel")) return "excel";
    if (formationId.includes("solaire")) return "conseil";
    return "initiation";
  };

  const getInitialData = (): LeadFormInitialData => {
    const formationMode = activeFilter === "en_ligne" ? "en_ligne" : "presentiel";
    return {
      type: "formation",
      title: formationTitle,
      formationId: mapFormationId(),
      formationMode,
    };
  };

  const defaultMsg = `Bonjour Cyber Cedest, je souhaite m'inscrire ou avoir des informations sur la formation : ${formationTitle}.`;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {/* 1. S'inscrire en ligne (ouvre la modale) */}
        <Button
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="gap-1.5 bg-primary text-primary-foreground font-semibold text-xs shadow-xs h-9"
        >
          <GraduationCap className="size-4" />
          <span>S’inscrire en ligne</span>
        </Button>

        {/* 2. Écrire sur WhatsApp */}
        <WhatsAppButton
          bouton="carte-formation"
          message={defaultMsg}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "gap-2 border-emerald-600/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-semibold text-xs shadow-xs h-9"
          )}
        >
          <span>Écrire sur WhatsApp</span>
        </WhatsAppButton>
      </div>

      {dialogOpen && (
        <LeadFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initialData={getInitialData()}
        />
      )}
    </>
  );
}
