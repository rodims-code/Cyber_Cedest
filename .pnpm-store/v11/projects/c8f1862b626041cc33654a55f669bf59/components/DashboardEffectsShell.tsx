"use client";

import * as React from "react";
import GhostFibers from "@/components/GhostFibers";
import {
  EffectPreferenceInitializer,
  EffectPreferenceSync,
  EFFECTS_CHANGE_EVENT,
} from "@/components/EffectPreference";

/**
 * Conteneur client pour le fond animé et les préférences d'effets du tableau de bord.
 *
 * GhostFibers (WebGL) et les effets GPU ne sont montés que lorsque `data-effects="on"`
 * sur `<html>`.
 * Quand l'effet est désactivé (`data-effects="off"`), GhostFibers n'est pas monté du tout
 * (aucun canvas, aucun calcul WebGL, aucune consommation GPU).
 */
export function DashboardEffectsShell({
  effectsEnabled,
  children,
}: {
  effectsEnabled: boolean;
  children: React.ReactNode;
}) {
  const [on, setOn] = React.useState(effectsEnabled);

  React.useEffect(() => {
    const root = document.documentElement;

    const apply = () => {
      setOn(root.dataset.effects !== "off");
    };

    apply();

    const observer = new MutationObserver(() => apply());
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-effects"],
    });

    const handleCustomChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setOn(detail !== "off");
    };
    window.addEventListener(EFFECTS_CHANGE_EVENT, handleCustomChange);

    return () => {
      observer.disconnect();
      window.removeEventListener(EFFECTS_CHANGE_EVENT, handleCustomChange);
    };
  }, []);

  return (
    <>
      <EffectPreferenceInitializer />
      <EffectPreferenceSync />
      {on && (
        <div
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          aria-hidden="true"
        >
          <GhostFibers className="h-full w-full" />
        </div>
      )}
      {children}
    </>
  );
}
