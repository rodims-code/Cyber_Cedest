"use client";

import * as React from "react";
import {
  Building2Icon,
  CheckCircle2Icon,
  CircleAlertIcon,
  PencilIcon,
  PlusIcon,
  PowerIcon,
  RotateCcwIcon,
  UsersIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  createSiteAction,
  renameSiteAction,
  toggleSiteAction,
  type SiteActionState,
} from "@/features/sites/admin-actions";
import type { SiteWithUsage } from "@/features/sites/queries";
import { cn } from "@/lib/utils";

function ActionMessage({ state }: { state: SiteActionState }) {
  if (state.error) {
    return (
      <p className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
        <CircleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>{state.error}</span>
      </p>
    );
  }

  if (state.ok && state.message) {
    return (
      <p className="flex items-start gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
        <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>{state.message}</span>
      </p>
    );
  }

  return null;
}

function CreateSiteForm({
  activeCount,
  maxSites,
}: {
  activeCount: number;
  maxSites: number;
}) {
  const [state, formAction, pending] = React.useActionState<
    SiteActionState,
    FormData
  >(createSiteAction, {});
  const formRef = React.useRef<HTMLFormElement>(null);
  const atLimit = activeCount >= maxSites;

  React.useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <PlusIcon className="size-4 text-primary" aria-hidden />
          Ajouter un site
        </CardTitle>
        <CardDescription>
          La limite actuelle est de {maxSites} sites actifs. La désactivation
          conserve les données et l&apos;historique du site.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-3">
          {atLimit && (
            <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
              <CircleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                Limite atteinte : {maxSites} sites actifs maximum. Désactivez
                un site existant avant d&apos;en créer un autre.
              </span>
            </p>
          )}

          <ActionMessage state={state} />

          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              name="nom"
              required
              minLength={2}
              maxLength={40}
              disabled={atLimit || pending}
              placeholder="Nom du nouveau site"
              aria-label="Nom du nouveau site"
              className="sm:flex-1"
            />
            <Button
              type="submit"
              disabled={atLimit || pending}
              className="gap-2"
            >
              <PlusIcon className="size-4" aria-hidden />
              {pending ? "Création…" : "Créer le site"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function SiteRow({
  site,
  activeCount,
  maxSites,
}: {
  site: SiteWithUsage;
  activeCount: number;
  maxSites: number;
}) {
  const [nom, setNom] = React.useState(site.nom);
  const [renameState, renameAction, renamePending] = React.useActionState<
    SiteActionState,
    FormData
  >(renameSiteAction, {});
  const [toggleState, toggleAction, togglePending] = React.useActionState<
    SiteActionState,
    FormData
  >(toggleSiteAction, {});

  const isLastActive = site.actif && activeCount <= 1;
  const cannotReactivate = !site.actif && activeCount >= maxSites;

  return (
    <Card className={cn(!site.actif && "opacity-80")}>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex size-8 items-center justify-center rounded-lg border bg-muted/40">
                <Building2Icon
                  className="size-4 text-muted-foreground"
                  aria-hidden
                />
              </span>
              <span className="truncate">{site.nom}</span>
            </CardTitle>
            <CardDescription className="mt-1 flex items-center gap-1.5">
              <UsersIcon className="size-3.5" aria-hidden />
              {site.nbUtilisateurs} utilisateur
              {site.nbUtilisateurs > 1 ? "s" : ""} assigné
              {site.nbUtilisateurs > 1 ? "s" : ""}
            </CardDescription>
          </div>

          <Badge variant={site.actif ? "secondary" : "outline"}>
            {site.actif ? "Actif" : "Inactif"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <form action={renameAction} className="space-y-2">
          <input type="hidden" name="id" value={site.id} />
          <label
            htmlFor={`site-name-${site.id}`}
            className="text-xs font-medium text-muted-foreground"
          >
            Nom du site
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id={`site-name-${site.id}`}
              name="nom"
              value={nom}
              onChange={(event) => setNom(event.target.value)}
              required
              minLength={2}
              maxLength={40}
              disabled={renamePending || togglePending}
              className="sm:flex-1"
            />
            <Button
              type="submit"
              variant="outline"
              disabled={
                renamePending ||
                togglePending ||
                nom.trim() === site.nom.trim()
              }
              className="gap-2"
            >
              <PencilIcon className="size-4" aria-hidden />
              {renamePending ? "Renommage…" : "Renommer"}
            </Button>
          </div>
          <ActionMessage state={renameState} />
        </form>

        <div className="border-t pt-3">
          <form action={toggleAction} className="flex flex-col gap-2">
            <input type="hidden" name="id" value={site.id} />
            <input
              type="hidden"
              name="actif"
              value={site.actif ? "false" : "true"}
            />
            <Button
              type="submit"
              variant={site.actif ? "outline" : "default"}
              disabled={
                togglePending ||
                renamePending ||
                isLastActive ||
                cannotReactivate
              }
              className="w-fit gap-2"
              title={
                isLastActive
                  ? "Au moins un site doit rester actif."
                  : cannotReactivate
                    ? `Limite de ${maxSites} sites actifs atteinte.`
                    : undefined
              }
            >
              {site.actif ? (
                <PowerIcon className="size-4" aria-hidden />
              ) : (
                <RotateCcwIcon className="size-4" aria-hidden />
              )}
              {togglePending
                ? "Mise à jour…"
                : site.actif
                  ? "Désactiver ce site"
                  : "Réactiver ce site"}
            </Button>

            {isLastActive && (
              <p className="text-xs text-muted-foreground">
                Au moins un site doit rester actif.
              </p>
            )}
            {cannotReactivate && (
              <p className="text-xs text-muted-foreground">
                Limite de {maxSites} sites actifs atteinte. Désactivez un autre
                site pour réactiver celui-ci.
              </p>
            )}

            <ActionMessage state={toggleState} />
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

export function SitesSettings({
  sites,
  activeCount,
  maxSites,
}: {
  sites: SiteWithUsage[];
  activeCount: number;
  maxSites: number;
}) {
  return (
    <section id="sites" className="scroll-mt-20 space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Building2Icon className="size-5 text-primary" aria-hidden />
            Sites
          </h2>
          <p className="text-sm text-muted-foreground">
            Créez, renommez ou désactivez les sites de Cyber Cedest. Un site
            désactivé conserve toutes ses données.
          </p>
        </div>
        <Badge variant={activeCount >= maxSites ? "destructive" : "outline"}>
          {activeCount}/{maxSites} sites actifs
        </Badge>
      </div>

      <CreateSiteForm activeCount={activeCount} maxSites={maxSites} />

      <div className="grid gap-4 lg:grid-cols-2">
        {sites.map((site) => (
          <SiteRow
            key={`${site.id}-${site.nom}`}
            site={site}
            activeCount={activeCount}
            maxSites={maxSites}
          />
        ))}
      </div>
    </section>
  );
}
