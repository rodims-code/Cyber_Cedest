/**
 * Politique de pointage.
 *
 * Le README prévoit que le pointage se fasse depuis les ordinateurs du cyber.
 * Cette règle n'est pas encore imposée : ce point d'extension permettra de
 * vérifier l'adresse IP ou le poste de travail sans modifier les Server Actions.
 */
export type PunchContext = {
  ip?: string | null;
  userAgent?: string | null;
};

export type PunchPolicyResult = {
  allowed: boolean;
  reason?: string;
};

export function canPunchFromHere(
  _context: PunchContext = {}
): PunchPolicyResult {
  // À brancher plus tard sur une liste d'IP/postiches autorisés.
  return { allowed: true };
}
