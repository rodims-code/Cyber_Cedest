"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deleteLeadAction } from "../actions";

export function DeleteLeadButton({ leadId }: { leadId: number }) {
  return (
    <form
      action={deleteLeadAction}
      className="inline-block"
      onSubmit={(event) => {
        if (!window.confirm("Supprimer définitivement cette demande ?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="leadId" value={leadId} />
      <Button type="submit" variant="destructive" size="sm" className="gap-1.5 text-xs h-8">
        <Trash2 className="size-3.5" />
        <span>Supprimer la demande</span>
      </Button>
    </form>
  );
}
