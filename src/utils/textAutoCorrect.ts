const corrections: Array<[RegExp, string]> = [
  [/\bsalon\b/gi, 'salón'], [/\bcalculdora\b/gi, 'calculadora'], [/\bcredncial\b/gi, 'credencial'],
  [/\bedifcio\b/gi, 'edificio'], [/\bmochla\b/gi, 'mochila'], [/\baudifonos\b/gi, 'audífonos'],
  [/\bpolideportibo\b/gi, 'polideportivo'], [/\bbibliotca\b/gi, 'biblioteca'],
];
export function textAutoCorrect(value: string) {
  let corrected = value.replace(/\s{2,}/g, ' ');
  for (const [pattern, replacement] of corrections) corrected = corrected.replace(pattern, replacement);
  return corrected.replace(/(^|[.!?]\s+)([a-záéíóúñ])/g, (_match, prefix: string, letter: string) => prefix + letter.toLocaleUpperCase('es-MX'));
}
