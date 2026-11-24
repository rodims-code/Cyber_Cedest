/**
 * Préférences d'affichage — interrupteur unique « Effet ».
 *
 * Le choix est mémorisé dans un cookie `effects` (`on` | `off`), lisible par le
 * serveur pour éviter tout flash au chargement. Ce cookie est par appareil et
 * n'est lié à aucun compte : le problème vient de la machine, et les ordinateurs
 * du cyber sont partagés.
 *
 * Ce module est le seul endroit qui lit et écrit le cookie `effects`.
 */
const EFFECTS_COOKIE = "effects";
const EFFECTS_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 an

export type EffectsValue = "on" | "off";

/**
 * Lit le cookie `effects` depuis un magasin de cookies serveur (next/headers).
 */
export function readEffectsCookie(
  getCookie: (name: string) => { value: string } | undefined
): EffectsValue | undefined {
  const raw = getCookie(EFFECTS_COOKIE)?.value;
  if (raw === "on" || raw === "off") return raw;
  return undefined;
}

/** Valeur par défaut quand aucun cookie n'est présent. */
export const DEFAULT_EFFECTS: EffectsValue = "on";

/**
 * Écrit le cookie `effects` depuis le navigateur (1 an, path=/).
 * Utilisé par le menu Affichage et l'initializer faible machine.
 */
export function setEffectsCookie(value: EffectsValue): void {
  if (typeof document === "undefined") return;

  document.cookie = `${EFFECTS_COOKIE}=${value}; max-age=${EFFECTS_COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
}

/**
 * Lit la valeur actuelle du cookie `effects` depuis le navigateur.
 */
export function getEffectsCookie(): EffectsValue | undefined {
  if (typeof document === "undefined") return undefined;

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${EFFECTS_COOKIE}=([^;]+)`)
  );
  const raw = match?.[1];
  if (raw === "on" || raw === "off") return raw;
  return undefined;
}
