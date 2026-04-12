// Eastern Arabic-Indic digits 0-9, used everywhere numbers appear in the UI.
const EAST = ['\u0660', '\u0661', '\u0662', '\u0663', '\u0664', '\u0665', '\u0666', '\u0667', '\u0668', '\u0669'];

export function toArabicDigits(input: number | string): string {
  return String(input).replace(/\d/g, (d) => EAST[+d]);
}
