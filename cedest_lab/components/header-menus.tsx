"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  CalendarDaysIcon,
  ClockIcon,
  DownloadIcon,
  HelpCircleIcon,
  KeyboardIcon,
  MenuIcon,
  MonitorIcon,
  MoonIcon,
  RefreshCwIcon,
  SparklesIcon,
  SunIcon,
  UserRoundIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import type { Role } from "@/lib/permissions";

function ShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyboardIcon className="size-4 text-primary" aria-hidden />
            Raccourcis clavier
          </DialogTitle>
          <DialogDescription>
            Les raccourcis disponibles dans le tableau de bord.
          </DialogDescription>
        </DialogHeader>

        <dl className="space-y-2 text-sm">
          {[
            ["Ctrl / Cmd + K", "Ouvrir la recherche"],
            ["Ctrl / Cmd + B", "Replier ou déplier la sidebar"],
            ["Entrée", "Ouvrir le premier résultat de recherche"],
            ["Échap", "Fermer la recherche ou un menu"],
          ].map(([keys, description]) => (
            <div
              key={keys}
              className="flex items-center justify-between gap-4 rounded-lg border bg-muted/30 px-3 py-2"
            >
              <dt className="text-muted-foreground">{description}</dt>
              <dd>
                <kbd className="rounded border bg-background px-1.5 py-0.5 text-xs font-medium">
                  {keys}
                </kbd>
              </dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  );
}

export function HeaderMenus({ role }: { role: Role }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);

  const themeValue = theme ?? "system";
  const isGerant = role === "gerant";
  const basePath = `/dashboard/${role}`;

  // « ? » ouvre le dialogue des raccourcis, hors champs de saisie.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "?") return;

      const target = event.target as HTMLElement | null;
      if (
        target?.closest("input, textarea, select, [contenteditable='true']")
      ) {
        return;
      }

      event.preventDefault();
      setShortcutsOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const openPlanning = (action: "generer" | "copier") => {
    router.push(`/dashboard/gerant/planning?action=${action}`);
  };

  const exportPlanning = () => {
    const link = document.createElement("a");
    link.href = "/dashboard/gerant/planning/export";
    link.download = "";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <>
      <Menubar className="hidden md:flex">
        {isGerant && (
          <MenubarMenu>
            <MenubarTrigger>Planning</MenubarTrigger>
            <MenubarContent>
              <MenubarGroup>
                <MenubarItem onClick={() => openPlanning("generer")}>
                  <SparklesIcon />
                  Générer la semaine
                </MenubarItem>
                <MenubarItem onClick={() => openPlanning("copier")}>
                  <RefreshCwIcon />
                  Copier la semaine précédente
                </MenubarItem>
              </MenubarGroup>
              <MenubarSeparator />
              <MenubarGroup>
                <MenubarItem onClick={exportPlanning}>
                  <DownloadIcon />
                  Exporter en Word
                </MenubarItem>
              </MenubarGroup>
            </MenubarContent>
          </MenubarMenu>
        )}

        <MenubarMenu>
          <MenubarTrigger>Pointage</MenubarTrigger>
          <MenubarContent>
            <MenubarGroup>
              <MenubarItem onClick={() => router.push(`${basePath}/pointage`)}>
                <ClockIcon />
                Ouvrir le pointage
              </MenubarItem>
              <MenubarItem
                onClick={() => router.push(`${basePath}/mon-espace`)}
              >
                <UserRoundIcon />
                Mon espace
              </MenubarItem>
            </MenubarGroup>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>Affichage</MenubarTrigger>
          <MenubarContent>
            <MenubarRadioGroup
              value={themeValue}
              onValueChange={(value) => {
                if (value) setTheme(value);
              }}
            >
              <MenubarRadioItem value="light">
                <SunIcon />
                Clair
              </MenubarRadioItem>
              <MenubarRadioItem value="dark">
                <MoonIcon />
                Sombre
              </MenubarRadioItem>
              <MenubarRadioItem value="system">
                <MonitorIcon />
                Système
              </MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>Aide</MenubarTrigger>
          <MenubarContent>
            <MenubarGroup>
              <MenubarItem onClick={() => setShortcutsOpen(true)}>
                <HelpCircleIcon />
                Raccourcis clavier
                <MenubarShortcut>?</MenubarShortcut>
              </MenubarItem>
            </MenubarGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              aria-label="Ouvrir le menu"
            />
          }
        >
          <MenuIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {isGerant && (
            <>
              <DropdownMenuGroup>
                <DropdownMenuLabel className="flex items-center gap-2">
                  <CalendarDaysIcon className="size-4" aria-hidden />
                  Planning
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => openPlanning("generer")}>
                  <SparklesIcon />
                  Générer la semaine
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openPlanning("copier")}>
                  <RefreshCwIcon />
                  Copier la semaine précédente
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportPlanning}>
                  <DownloadIcon />
                  Exporter en Word
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuGroup>
            <DropdownMenuLabel>Pointage</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push(`${basePath}/pointage`)}>
              <ClockIcon />
              Ouvrir le pointage
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`${basePath}/mon-espace`)}
            >
              <UserRoundIcon />
              Mon espace
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={themeValue}
            onValueChange={(value) => {
              if (value) setTheme(value);
            }}
          >
            <DropdownMenuLabel>Affichage</DropdownMenuLabel>
            <DropdownMenuRadioItem value="light">
              <SunIcon />
              Clair
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">
              <MoonIcon />
              Sombre
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system">
              <MonitorIcon />
              Système
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShortcutsOpen(true)}>
            <HelpCircleIcon />
            Raccourcis clavier
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </>
  );
}
