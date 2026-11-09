"use client";

import { useActionState, useEffect, useRef } from "react";
import { createStaffUser, CreateUserState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, CheckCircle2, AlertCircle } from "lucide-react";

export function CreateUserForm() {
  const [state, formAction, isPending] = useActionState<CreateUserState, FormData>(
    createStaffUser,
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state.ok]);

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <UserPlus className="size-5 text-primary" />
          Ajouter un membre du personnel
        </h2>
        <p className="text-xs text-muted-foreground">
          Créez un compte pour un opérateur ou un technicien. Seul le gérant a ce droit.
        </p>
      </div>

      <form ref={formRef} action={formAction} className="space-y-4">
        {state.error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        {state.ok && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>Le compte a été créé avec succès !</span>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium" htmlFor="name">
              Nom complet *
            </label>
            <Input
              id="name"
              name="name"
              required
              minLength={2}
              placeholder="Ex: Christian Mukendi"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium" htmlFor="email">
              Adresse e-mail professionnelle *
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Ex: operateur@cybercedest.cd"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium" htmlFor="password">
              Mot de passe initial (min 8 caractères) *
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium" htmlFor="role">
              Rôle attribué *
            </label>
            <select
              id="role"
              name="role"
              required
              defaultValue="operateur"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="operateur">Opérateur</option>
              <option value="technicien">Technicien</option>
            </select>
          </div>
        </div>

        <Button type="submit" disabled={isPending} className="gap-2">
          <UserPlus className="size-4" />
          {isPending ? "Création en cours..." : "Créer le compte"}
        </Button>
      </form>
    </div>
  );
}
