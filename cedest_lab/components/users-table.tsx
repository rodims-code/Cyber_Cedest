"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Search, X } from "lucide-react";

import { toggleStaffUser } from "@/features/users/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type StaffUser = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  banned: boolean;
  createdAt: string; // ISO, sérialisable du serveur vers le client
};

const ROLES: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  gerant: { label: "Gérant", variant: "default" },
  operateur: { label: "Opérateur", variant: "secondary" },
  technicien: { label: "Technicien", variant: "outline" },
};

type StatusFilter = "all" | "active" | "disabled";

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Africa/Kinshasa",
});

// "Élodie" et "elodie" doivent se trouver mutuellement
const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

/* ---------- Petits composants ---------- */

function Avatar({ name, disabled }: { name: string; disabled: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground",
        disabled && "opacity-60",
      )}
    >
      {initials(name)}
    </span>
  );
}

// Le statut n'est jamais porté par la couleur seule : point + texte
function StatusLabel({ banned }: { banned: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span
        aria-hidden
        className={cn(
          "size-2 rounded-full",
          banned ? "bg-destructive" : "bg-emerald-500",
        )}
      />
      {banned ? "Désactivé" : "Actif"}
    </span>
  );
}

function SubmitButton({
  children,
  pendingLabel,
  variant = "default",
}: {
  children: React.ReactNode;
  pendingLabel: string;
  variant?: "default" | "destructive" | "outline";
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} disabled={pending}>
      {pending ? pendingLabel : children}
    </Button>
  );
}

function RowAction({
  staff,
  isCurrent,
}: {
  staff: StaffUser;
  isCurrent: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (isCurrent) {
    return <span className="text-sm text-muted-foreground">Votre compte</span>;
  }

  const hiddenFields = (
    <>
      <input type="hidden" name="id" value={staff.id} />
      <input type="hidden" name="banned" value={String(!staff.banned)} />
    </>
  );

  // Réactiver est sans risque : pas de confirmation
  if (staff.banned) {
    return (
      <form action={toggleStaffUser}>
        {hiddenFields}
        <SubmitButton variant="outline" pendingLabel="Réactivation…">
          Réactiver
        </SubmitButton>
      </form>
    );
  }

  // Désactiver coupe l'accès de la personne : on demande confirmation
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-muted-foreground">
          Désactiver
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Désactiver le compte de {staff.name} ?</DialogTitle>
          <DialogDescription>
            Cette personne ne pourra plus se connecter. Ses heures, son
            planning et ses paies restent conservés. Vous pourrez réactiver le
            compte à tout moment.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <form action={toggleStaffUser} onSubmit={() => setOpen(false)}>
            {hiddenFields}
            <SubmitButton variant="destructive" pendingLabel="Désactivation…">
              Désactiver le compte
            </SubmitButton>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Composant principal ---------- */

export function UsersTable({
  users,
  currentUserId,
}: {
  users: StaffUser[];
  currentUserId: string;
}) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const searchRef = useRef<HTMLInputElement>(null);

  // Raccourci "/" pour aller à la recherche, utile quand on travaille longtemps
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const counts = useMemo(
    () => ({
      all: users.length,
      active: users.filter((u) => !u.banned).length,
      disabled: users.filter((u) => u.banned).length,
    }),
    [users],
  );

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return users.filter((u) => {
      if (status === "active" && u.banned) return false;
      if (status === "disabled" && !u.banned) return false;
      if (role !== "all" && u.role !== role) return false;
      if (q && !normalize(`${u.name} ${u.email}`).includes(q)) return false;
      return true;
    });
  }, [users, query, role, status]);

  const hasFilters = query !== "" || role !== "all" || status !== "all";
  const reset = () => {
    setQuery("");
    setRole("all");
    setStatus("all");
  };

  const statusTabs: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "Tous" },
    { value: "active", label: "Actifs" },
    { value: "disabled", label: "Désactivés" },
  ];

  return (
    <div className="space-y-4">
      {/* Barre d'outils */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative md:max-w-xs md:flex-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un nom ou un e-mail"
            aria-label="Rechercher un compte"
            className="pl-9"
          />
        </div>

        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-full md:w-44" aria-label="Filtrer par rôle">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            {Object.entries(ROLES).map(([value, { label }]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div
          role="group"
          aria-label="Filtrer par statut"
          className="inline-flex rounded-lg border bg-muted/40 p-0.5 md:ml-auto"
        >
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              aria-pressed={status === tab.value}
              onClick={() => setStatus(tab.value)}
              className={cn(
                "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex-none",
                status === tab.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
              <span className="ml-1.5 tabular-nums text-muted-foreground">
                {counts[tab.value]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Résultat vide */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed py-12 text-center">
          <p className="font-medium">Aucun compte ne correspond</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Essayez un autre nom ou retirez un filtre.
          </p>
          {hasFilters && (
            <Button variant="outline" className="mt-4" onClick={reset}>
              <X className="size-4" />
              Effacer les filtres
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Téléphone : une ligne par personne */}
          <ul className="divide-y rounded-lg border bg-card md:hidden">
            {filtered.map((staff) => {
              const meta = ROLES[staff.role ?? ""] ?? {
                label: staff.role || "Inconnu",
                variant: "secondary" as const,
              };
              return (
                <li key={staff.id} className="space-y-3 p-4">
                  <div className="flex items-start gap-3">
                    <Avatar name={staff.name} disabled={staff.banned} />
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "truncate font-medium",
                          staff.banned && "text-muted-foreground",
                        )}
                      >
                        {staff.name}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {staff.email}
                      </p>
                    </div>
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <StatusLabel banned={staff.banned} />
                    <RowAction
                      staff={staff}
                      isCurrent={staff.id === currentUserId}
                    />
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Ordinateur : tableau */}
          <div className="hidden overflow-hidden rounded-lg border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="pl-4">Collaborateur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className="pr-4 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((staff) => {
                  const meta = ROLES[staff.role ?? ""] ?? {
                    label: staff.role || "Inconnu",
                    variant: "secondary" as const,
                  };
                  return (
                    <TableRow key={staff.id} className="h-16">
                      <TableCell className="pl-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={staff.name} disabled={staff.banned} />
                          <div className="min-w-0">
                            <p
                              className={cn(
                                "truncate font-medium",
                                staff.banned && "text-muted-foreground",
                              )}
                            >
                              {staff.name}
                            </p>
                            <p className="truncate text-sm text-muted-foreground">
                              {staff.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <StatusLabel banned={staff.banned} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {dateFormat.format(new Date(staff.createdAt))}
                      </TableCell>
                      <TableCell className="pr-4 text-right">
                        <RowAction
                          staff={staff}
                          isCurrent={staff.id === currentUserId}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <p className="text-sm text-muted-foreground" aria-live="polite">
            {filtered.length} sur {users.length} compte
            {users.length > 1 ? "s" : ""}
          </p>
        </>
      )}
    </div>
  );
}