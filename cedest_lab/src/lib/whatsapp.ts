import { siteConfig } from "@/src/config/site";

/**
 * Normalise un numéro de téléphone RDC en 243XXXXXXXXX.
 * Accepte 0XX XXX XXXX, +243..., 243... avec espaces ou tirets.
 * Retourne null si le format est invalide.
 */
export function normalizeRdcPhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("00243") && digits.length === 14) {
    return digits.slice(2);
  }
  if (digits.startsWith("243") && digits.length === 12) {
    return digits;
  }
  if (digits.startsWith("0") && digits.length === 10) {
    return `243${digits.slice(1)}`;
  }
  if (digits.length === 9) {
    return `243${digits}`;
  }

  return null;
}

/**
 * Construit un lien wa.me avec numéro et message encodé.
 */
export function buildWhatsAppLink(phone: string, message: string): string {
  const normalized = normalizeRdcPhone(phone) || phone.replace(/\D/g, "");
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

/** Compatibilité ancien code */
export function createWhatsAppLink(phone: string, message: string): string {
  return buildWhatsAppLink(phone, message);
}

/**
 * Message client → cyber :
 * « Bonjour Cyber Cedest, ma demande <CED-0042> : <service>. »
 */
export function buildClientToCyberWhatsAppLink(
  numeroFormate: string,
  serviceLabel: string
): string {
  const message = `Bonjour Cyber Cedest, ma demande ${numeroFormate} : ${serviceLabel}.`;
  return buildWhatsAppLink(siteConfig.whatsappNumber, message);
}

/**
 * Message cyber → client :
 * « Bonjour <nom>, ici Cyber Cedest. Nous avons bien reçu votre demande <CED-0042> (<service>). »
 */
export function buildCyberToClientWhatsAppLink(
  clientPhone: string,
  clientNom: string,
  numeroFormate: string,
  serviceLabel: string
): string {
  const message = `Bonjour ${clientNom}, ici Cyber Cedest. Nous avons bien reçu votre demande ${numeroFormate} (${serviceLabel}).`;
  return buildWhatsAppLink(clientPhone, message);
}
