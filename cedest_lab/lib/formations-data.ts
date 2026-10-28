export type FormationMode = "presentiel" | "en_ligne" | "hybride"

export interface Formation {
  id: string
  title: string
  category: string
  shortDescription: string
  mode: FormationMode // "presentiel" | "en_ligne" | "hybride"
  modeLabel: string
  duration: string
  level: "Débutant" | "Intermédiaire" | "Avancé" | "Tous niveaux"
  prerequisites: string
  modules: string[]
  certificate: boolean
  featured?: boolean
  image?: string
}

/**
 * =========================================================================
 * LISTE DES FORMATIONS CYBER CEDEST
 * Pour ajouter ou modifier une formation, modifiez simplement cette liste !
 * =========================================================================
 */
export const FORMATIONS_LIST: Formation[] = [
  {
    id: "initiation-informatique",
    title: "Initiation à l'Informatique",
    category: "Bases Numériques",
    shortDescription:
      "Apprenez à maîtriser l'ordinateur de A à Z : système Windows, gestion des fichiers, navigation Internet sécurisée et outils fondamentaux.",
    mode: "hybride",
    modeLabel: "Présentiel ou En ligne",
    duration: "3 semaines (15 heures)",
    level: "Débutant",
    prerequisites: "Aucun prérequis nécessaire",
    certificate: true,
    featured: true,
    image: "/images/services/formation.jpg",
    modules: [
      "Prise en main du matériel (clavier, souris, unité centrale, périphériques)",
      "Environnement Windows : fenêtres, dossiers, clés USB et organisation",
      "Recherche Internet, sécurité, navigation et gestion des emails",
      "Découverte des raccourcis essentiels et bonnes pratiques",
    ],
  },
  {
    id: "microsoft-word",
    title: "Microsoft Word - Rédaction Professionnelle",
    category: "Bureautique",
    shortDescription:
      "Concevez des documents administratifs impeccables, mémoires, rapports, lettres officielles et formulaires avec une mise en page soignée.",
    mode: "hybride",
    modeLabel: "Présentiel ou En ligne",
    duration: "2 à 3 semaines",
    level: "Tous niveaux",
    prerequisites: "Notions de base en informatique",
    certificate: true,
    image: "/images/services/bureautique.jpg",
    modules: [
      "Saisie rapide, correction orthographique et mise en forme de texte",
      "Création de tableaux, insertion d'images, formes et en-têtes/pieds de page",
      "Gestion des styles de titres, table des matières automatique et pagination",
      "Mise en page avancée pour mémoires universitaires et rapports de travail",
    ],
  },
  {
    id: "microsoft-excel",
    title: "Microsoft Excel - Tableaux & Formules de Gestion",
    category: "Bureautique Avancée",
    shortDescription:
      "Devenez autonome sur les calculs automatisés, la création de factures, de bilans simples, de tableaux de bord et de graphiques dynamiques.",
    mode: "hybride",
    modeLabel: "Présentiel ou En ligne",
    duration: "3 à 4 semaines",
    level: "Tous niveaux",
    prerequisites: "Savoir utiliser un ordinateur",
    certificate: true,
    featured: true,
    image: "/images/gallery/session-formation.jpg",
    modules: [
      "Structure d'un classeur, cellules, colonnes et formats de données",
      "Formules fondamentales : SOMME, MOYENNE, SI, RECHERCHEV/X",
      "Création de tableaux financiers, gestion de stock et factures",
      "Graphiques clairs, filtres automatiques et tableaux croisés dynamiques",
    ],
  },
  {
    id: "panneaux-solaires",
    title: "Installation & Maintenance de Panneaux Solaires",
    category: "Énergie & Technique",
    shortDescription:
      "Formation pratique aux systèmes photovoltaïques : dimensionnement de charge, pose de panneaux solaires, branchement d'onduleurs et gestion des batteries.",
    mode: "presentiel",
    modeLabel: "En Présentiel (Atelier Pratique)",
    duration: "4 semaines (cours + manipulation)",
    level: "Tous niveaux",
    prerequisites: "Intérêt pour l'électricité ou le bricolage technique",
    certificate: true,
    featured: true,
    image: "/images/services/energie-solaire.jpg",
    modules: [
      "Principes de base du solaire photovoltaïque & sécurité électrique",
      "Calcul des besoins énergétiques et dimensionnement d'un kit solaire",
      "Montage physique des panneaux en toiture et orientations optimales",
      "Câblage des onduleurs hybrides, régulateurs MPPT et bancs de batteries",
      "Diagnostic de pannes, entretien et maintenance préventive",
    ],
  },
]
