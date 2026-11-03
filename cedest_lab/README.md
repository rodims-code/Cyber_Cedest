# Cyber Cedest Lab

Application interne de Cyber Cedest à Kinshasa, construite avec Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Better Auth et Drizzle.

## Démarrage

```bash
npm run dev
```

L’application est disponible sur `http://localhost:3000`.

## Authentification et rôles

L’authentification utilise Better Auth avec le plugin `admin`. Le rôle de l’utilisateur connecté est disponible dans `session.user.role`.

Les rôles applicatifs sont :

| Rôle | Pages accessibles depuis la sidebar |
| --- | --- |
| `gerant` | Mon espace, Demandes, Planning, Pointage, Caisse, Paie, Utilisateurs, Formations |
| `operateur` | Mon espace, Demandes, Pointage, Caisse |
| `technicien` | Mon espace, Demandes, Pointage |
| `formateur` | Mon espace, Sessions de formation, Inscrits |
| `eleve` | Tableau de bord uniquement (pages à définir) |

Tous les rôles, à l’exception de l’élève dont le menu reste volontairement minimal, disposent de **Mon espace** pour leurs informations personnelles : planning, heures et paie.

Après connexion, l’utilisateur est envoyé vers `/dashboard/<role>`.

## Dashboards

Les dashboards sont organisés par rôle dans `app/dashboard/<role>/` :

```text
app/dashboard/
├── eleve/
├── formateur/
├── gerant/
├── operateur/
└── technicien/
```

La configuration centralisée des menus est dans `components/app-sidebar.tsx` :

- `baseItems` contient les liens communs ;
- `roleBasedItems` contient les liens propres à chaque rôle ;
- `authClient.useSession()` récupère la session côté client ;
- sans session valide, la sidebar redirige vers `/login`.

Les pages liées dans la sidebar sont actuellement des pages minimales lorsqu’aucune interface métier n’existe encore.

## Sécurité des accès

Masquer un lien dans la sidebar ne constitue pas une protection. Les pages et Server Actions doivent vérifier le rôle côté serveur avec `requireRole()` depuis `lib/session.ts` et les règles de `lib/permissions.ts`.

À ce stade, les dashboards par rôle n’ont pas encore de `layout.tsx` dédié qui appelle `requireRole()`. Cette vérification doit être ajoutée avant de considérer les routes comme protégées.

## Scripts utiles

```bash
npm run dev
npm run build
npm run lint
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio
```
