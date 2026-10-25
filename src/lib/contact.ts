const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * mailto:-Link zur allgemeinen Kontakt-E-Mail aus den Globalen Einstellungen (Kontakt & Adresse →
 * „E-Mail“). Ohne gültige Adresse `null`, damit kein leerer bzw. kaputter Link entsteht.
 */
export function buildContactMailto(email: string | undefined, subject: string) {
  const address = email?.trim();
  return address && EMAIL_PATTERN.test(address) ? `mailto:${address}?subject=${encodeURIComponent(subject)}` : null;
}
