/**
 * UI-only text normalization helpers.
 * These transform display strings at render time and never modify stored data.
 */

const OLD_TITLE_VI = 'Bản đồ số Di sản Văn hóa Vân Đình';
const NEW_TITLE_VI = 'Bản đồ di sản số';
const OLD_TITLE_EN = 'Van Dinh Digital Cultural Heritage Map';
const NEW_TITLE_EN = 'Van Dinh Digital Heritage Map';

/** Normalize the displayed website title (legacy DB value → new official title). */
export function displaySiteTitle(name?: string | null, lang: 'vi' | 'en' = 'vi'): string {
  if (!name) return lang === 'vi' ? NEW_TITLE_VI : NEW_TITLE_EN;
  let out = name;
  if (out === OLD_TITLE_VI) out = NEW_TITLE_VI;
  if (out === OLD_TITLE_EN) out = NEW_TITLE_EN;
  return out;
}

/**
 * Replace outdated district references ("huyện Ứng Hòa") with the city-level
 * administrative unit ("thành phố Hà Nội") in any displayed location text.
 */
export function sanitizeLocation(text: string | null | undefined): string {
  if (!text) return '';
  let out = text;
  // Vietnamese: "huyện Ứng Hòa" (or Ứng Hoà, Ứng Hoa) → "thành phố Hà Nội"
  out = out.replace(/huyện\s+Ứng\s+H[oò][aà]?/gi, 'thành phố Hà Nội');
  // English: "Ung Hoa District" (or Ung Hoà District) → "Hanoi"
  out = out.replace(/Ung\s+H[oò][aà]?\s+District/gi, 'Hanoi');
  // Avoid duplicated city suffix produced by the replacement above
  out = out.replace(/thành phố Hà Nội,?\s*thành phố Hà Nội/gi, 'thành phố Hà Nội');
  out = out.replace(/Hanoi,?\s*Hanoi/gi, 'Hanoi');
  // Trim leftover separators
  out = out.replace(/,\s*,/g, ',');
  return out.trim();
}