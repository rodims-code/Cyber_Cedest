"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { FileText, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { WhatsAppButton, type WhatsAppBoutonType } from "@/components/shared/whatsapp-button";
import { cn } from "@/lib/utils";
import type { LeadFormInitialData } from "./lead-form-dialog";

// Chargé uniquement à l'ouverture (Phase 3 règle 1)
const LeadFormDialog = dynamic(
  () => import("./lead-form-dialog").then((mod) => mod.LeadFormDialog),
  { ssr: false }
);

interface ServiceCardActionsProps {
  serviceId: "bureautique" | "wifi" | "solaire" | "formation";
  serviceTitle: string;
}

export function ServiceCardActions({
  serviceId,
  serviceTitle,
}: ServiceCardActionsProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const getInitialData = (): LeadFormInitialData => {
    if (serviceId === "formation") {
      return {
        type: "formation",
        title: serviceTitle,
        formationId: "initiation",
        formationMode: "presentiel",
      };
    }
    if (serviceId === "wifi") {
      return {
        type: "wifi",
        title: serviceTitle,
      };
    }
    if (serviceId === "solaire") {
      return {
        type: "solaire",
        title: serviceTitle,
      };
    }
    return {
      type: "contact",
      title: serviceTitle,
      sujet: "bureautique",
    };
  };

  const boutonType: WhatsAppBoutonType =
    serviceId === "bureautique"
      ? "carte-bureautique"
      : serviceId === "wifi"
      ? "carte-wifi"
      : serviceId === "solaire"
      ? "carte-solaire"
      : "carte-formation";

  const defaultMsg = `Bonjour Cyber Cedest, je souhaite des informations concernant le service : ${serviceTitle}.`;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {/* 1. Formulaire en ligne */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="text-xs gap-1.5 h-8 font-medium"
        >
          <FileText className="size-3.5 text-primary" />
          <span>Demander un devis</span>
        </Button>

        {/* 2. Bouton WhatsApp avec tracking */}
        <WhatsAppButton
          bouton={boutonType}
          message={defaultMsg}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "text-xs gap-1.5 h-8 font-medium hover:text-emerald-600"
          )}
        >
          <span>Écrire sur WhatsApp</span>
        </WhatsAppButton>

        {/* Lien catalogue pour formation */}
        {serviceId === "formation" && (
          <Link
            href="/formations"
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "text-xs gap-1.5 h-8 font-medium shadow-xs"
            )}
          >
            <GraduationCap className="size-3.5" />
            <span>Voir le programme</span>
          </Link>
        )}
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
