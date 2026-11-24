"use client";

import * as React from "react";
import { toast } from "@/components/ui/toast";
import {
  getEffectsCookie,
  setEffectsCookie,
  type EffectsValue,
} from "@/src/lib/display-preferences";

export const EFFECTS_CHANGE_EVENT = "cedest-effects-preference-change";

/**
 * Initialise l'effet de fond au premier chargement.
 *
 * - Si un cookie `effects` existe déjà (choix fait par la personne ou par une
 *   autre session), rien n'est fait : le choix manuel n'est jamais écrasé.
 * - Sinon, sur une machine faible (réduction de mouvement, économie de données,
 *   peu de cœurs ou peu de mémoire), l'effet est désactivé par défaut et un
 *   toast l'informe une seule fois.
 *
 * Le cookie est par appareil et n'est lié au compte : les ordinateurs du cyber
 * sont partagés.
 */
export function EffectPreferenceInitializer() {
  React.useEffect(() => {
    if (getEffectsCookie() !== undefined) return;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData =
      typeof navigator !== "undefined" &&
      (navigator as { connection?: { saveData?: boolean } }).connection
        ?.saveData === true;
    const lowCpu =
      typeof navigator !== "undefined" &&
      (navigator.hardwareConcurrency ?? 8) <= 4;
    const lowRam =
      typeof navigator !== "undefined" &&
      ((navigator as { deviceMemory?: number }).deviceMemory ?? 8) <= 4;

    if (!reducedMotion && !saveData && !lowCpu && !lowRam) return;

    setEffects("off");

    toast.add({
      title: "Effet de flou désactivé pour économiser les ressources de cet appareil. Vous pouvez le réactiver dans Affichage.",
      description: "Le fond animé et flou ne se chargera plus sur cet appareil.",
    });
  }, []);

  return null;
}

/**
 * Synchronise l'attribut `data-effects` sur `<html>` avec le cookie actuel.
 * Utile quand le choix a été changé depuis un autre onglet sans rechargement.
 */
export function EffectPreferenceSync() {
  React.useEffect(() => {
    const update = () => {
      const next = getEffectsCookie() ?? "on";
      if (typeof document !== "undefined") {
        document.documentElement.dataset.effects = next;
      }
    };

    update();

    const onVisibility = () => {
      if (document.visibilityState === "visible") update();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return null;
}

/**
 * Retourne la valeur courante de l'effet (`on` | `off`).
 */
export function isEffectsOn(): boolean {
  if (typeof document !== "undefined") {
    const attr = document.documentElement.dataset.effects;
    if (attr === "on" || attr === "off") return attr === "on";
  }
  const cookie = typeof document !== "undefined" ? getEffectsCookie() : undefined;
  if (cookie !== undefined) return cookie === "on";
  return true;
}

/**
 * Active ou désactive l'effet immédiatement : attribut `<html>` + cookie + broadcast,
 * sans rechargement.
 */
export function setEffects(value: EffectsValue): void {
  setEffectsCookie(value);
  if (typeof document !== "undefined") {
    document.documentElement.dataset.effects = value;
    window.dispatchEvent(
      new CustomEvent(EFFECTS_CHANGE_EVENT, { detail: value })
    );
  }
}
