/**
 * Liens WhatsApp (wa.me).
 *
 * Les numéros sont normalisés au format international sans `+` ni espaces,
 * avec l'indicatif RDC par défaut (+243) pour les formats locaux.
 */

/** « 081 234 5678 » → « 243812345678 » ; « +243 812 345 678 » → « 243812345678 ». */
export function normalizePhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("00243")) return digits.slice(2);
  if (digits.startsWith("243")) return digits;
  if (digits.startsWith("0")) return `243${digits.slice(1)}`;

  return digits;
}

/** Construit un lien `https://wa.me/<numéro>?text=<message>`. */
export function buildWhatsAppLink(phone: string, message: string): string {
  const normalized = normalizePhoneForWhatsApp(phone);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
