/**
 * Limites et constantes de configuration du cyber et des sites.
 * MAX_SITES est vérifié côté serveur dans les Server Actions de gestion des sites.
 */
export const MAX_SITES = 2;

export const SITE_NAME_MIN_LENGTH = 2;
export const SITE_NAME_MAX_LENGTH = 40;

export const siteConfig = {
  name: "Cyber Cedest",
  description:
    "Cyber Cedest à Kinshasa (RDC) : secrétariat & bureautique, distribution internet Wi-Fi par antenne MikroTik, énergie solaire autonome et formations informatiques.",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "243000000000",
  sites: [
    { id: "kimiala", nom: "KIMIALA" },
    { id: "shell", nom: "SHELL" },
  ],
};
