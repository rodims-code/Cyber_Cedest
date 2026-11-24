"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CornerDownLeftIcon,
  Loader2Icon,
  PhoneIcon,
  SearchIcon,
  UserRoundIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  searchLeads,
  type LeadSearchResult,
} from "@/features/search/actions";
import {
  getNavigation,
  normalizeSearchText,
  type NavLink,
} from "@/lib/navigation";
import type { Role } from "@/lib/permissions";
import { OPEN_SEARCH_EVENT } from "@/lib/search-events";

const leadTypeLabels: Record<string, string> = {
  formation: "Formation",
  wifi: "Wi-Fi",
  solaire: "Solaire",
  bureautique: "Bureautique",
  autre: "Autre",
};

const statusLabels: Record<string, string> = {
  nouveau: "Nouveau",
  en_cours: "En cours",
  converti: "Converti",
  annule: "Annulé",
};

type LeadSearchState = {
  query: string;
  rows: LeadSearchResult[];
  error: string | null;
};

const EMPTY_SEARCH: LeadSearchState = { query: "", rows: [], error: null };

export function CommandPalette({ role }: { role: Role }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [result, setResult] = React.useState<LeadSearchState>(EMPTY_SEARCH);

  const navigation = React.useMemo(() => getNavigation(role), [role]);
  const allPages = React.useMemo(
    () => [...navigation.main, ...navigation.exploitation, ...navigation.secondary],
    [navigation]
  );

  const normalizedQuery = normalizeSearchText(query);
  const pageResults = React.useMemo(() => {
    if (!normalizedQuery) return allPages;
    return allPages.filter((item) =>
      normalizeSearchText(item.title).includes(normalizedQuery)
    );
  }, [allPages, normalizedQuery]);

  const trimmedQuery = query.trim();
  const isSearching = trimmedQuery.length >= 2 && result.query !== trimmedQuery;
  const leads = result.query === trimmedQuery ? result.rows : [];
  const error = result.query === trimmedQuery ? result.error : null;

  const openPalette = React.useCallback(() => {
    setQuery("");
    setResult(EMPTY_SEARCH);
    setOpen(true);
  }, []);

  // Ouverture : Ctrl+K / Cmd+K ou clic sur « Recherche » dans la sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        openPalette();
      }
    };

    const handleOpen = () => openPalette();

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener(OPEN_SEARCH_EVENT, handleOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener(OPEN_SEARCH_EVENT, handleOpen);
    };
  }, [openPalette]);

  React.useEffect(() => {
    if (!open) return;

    const trimmed = query.trim();
    if (trimmed.length < 2) return;

    let cancelled = false;

    const timer = window.setTimeout(async () => {
      try {
        const rows = await searchLeads(trimmed);
        if (!cancelled) {
          setResult({ query: trimmed, rows, error: null });
        }
      } catch (searchError) {
        console.error("Erreur recherche demandes:", searchError);
        if (!cancelled) {
          setResult({
            query: trimmed,
            rows: [],
            error: "La recherche de demandes a échoué.",
          });
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, open]);

  const goTo = React.useCallback(
    (url: string) => {
      setOpen(false);
      router.push(url);
    },
    [router]
  );

  const firstResult = pageResults[0] ?? leads[0];

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || !firstResult) return;
    event.preventDefault();

    if ("url" in firstResult) {
      goTo((firstResult as NavLink).url);
    } else {
      goTo(`/dashboard/${role}/demandes/${(firstResult as LeadSearchResult).id}`);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          openPalette();
        } else {
          setOpen(false);
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-xl gap-0 overflow-hidden p-0"
      >
        <DialogTitle className="sr-only">Recherche</DialogTitle>
        <DialogDescription className="sr-only">
          Rechercher une page, une demande par nom ou par téléphone.
        </DialogDescription>

        <div className="flex items-center gap-2 border-b px-3">
          <SearchIcon
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Rechercher une page, un client, un téléphone…"
            aria-label="Rechercher"
            className="h-12 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
          />
          <kbd className="hidden shrink-0 rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">
            Échap
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          <section aria-labelledby="search-pages-heading">
            <p
              id="search-pages-heading"
              className="px-2 py-1.5 text-xs font-medium text-muted-foreground"
            >
              Pages
            </p>

            {pageResults.length === 0 ? (
              <p className="px-2 py-3 text-sm text-muted-foreground">
                Aucune page ne correspond.
              </p>
            ) : (
              <ul className="space-y-0.5">
                {pageResults.map((item) => (
                  <li key={item.url}>
                    <Button
                      variant="ghost"
                      className="h-9 w-full justify-start gap-2 px-2"
                      onClick={() => goTo(item.url)}
                    >
                      <item.icon className="size-4 text-muted-foreground" aria-hidden />
                      <span>{item.title}</span>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {query.trim().length >= 2 && (
            <section aria-labelledby="search-leads-heading" className="mt-2">
              <div className="flex items-center justify-between px-2 py-1.5">
                <p
                  id="search-leads-heading"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Demandes
                </p>
                {isSearching && (
                  <Loader2Icon
                    className="size-3.5 animate-spin text-muted-foreground"
                    aria-label="Recherche en cours"
                  />
                )}
              </div>

              {error ? (
                <p className="px-2 py-3 text-sm text-destructive">{error}</p>
              ) : leads.length === 0 && !isSearching ? (
                <p className="px-2 py-3 text-sm text-muted-foreground">
                  Aucune demande trouvée.
                </p>
              ) : (
                <ul className="space-y-0.5">
                  {leads.map((lead) => (
                    <li key={lead.id}>
                      <Button
                        variant="ghost"
                        className="h-auto w-full justify-start gap-3 px-2 py-2"
                        onClick={() =>
                          goTo(`/dashboard/${role}/demandes/${lead.id}`)
                        }
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background">
                          <UserRoundIcon
                            className="size-4 text-muted-foreground"
                            aria-hidden
                          />
                        </span>
                        <span className="min-w-0 flex-1 text-left">
                          <span className="block truncate text-sm font-medium">
                            {lead.nom}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <PhoneIcon className="size-3" aria-hidden />
                            {lead.telephone} ·{" "}
                            {leadTypeLabels[lead.type] ?? lead.type} ·{" "}
                            {statusLabels[lead.status] ?? lead.status}
                          </span>
                        </span>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>

        <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CornerDownLeftIcon className="size-3" aria-hidden />
            Entrée pour ouvrir le premier résultat
          </span>
          <span className="hidden sm:inline">Ctrl K pour rouvrir</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
