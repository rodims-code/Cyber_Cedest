/**
 * Le alias `@/*` pointe vers la racine du projet (voir tsconfig.json).
 * L'implémentation canonique de `getCurrentSite()` se trouve donc dans
 * `lib/current-site.ts`. Ce fichier conserve le chemin `src/lib/current-site.ts`
 * utilisé par certaines conventions de projet.
 */
export * from "@/lib/current-site";
