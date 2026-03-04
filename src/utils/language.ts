const ARABIC_REGEX = /[\u0600-\u06FF]/;
const FRENCH_HINTS = /\b(bonjour|merci|commande|livraison|payer|panier)\b/i;

export function detectLanguage(input: string): string {
  if (!input) return 'en';
  if (ARABIC_REGEX.test(input)) return 'ar';
  if (FRENCH_HINTS.test(input)) return 'fr';
  return 'en';
}
