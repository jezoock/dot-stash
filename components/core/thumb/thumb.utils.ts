import { DS_THUMB_DEFAULT_RATIO } from './thumb.constants';

/**
 * The ratio of a thumbnail as CSS writes it (`2 / 3`), from `2/3`, `2 / 3`, `16:9`, `1` or `1.5`: two positive numbers, or
 * one. A value that is not one gives the default ratio, a square.
 */
export const toRatio = (ratio: string | number | undefined | null): string => {
  const parts = String(ratio ?? '')
    .trim()
    .split(/\s*[/:]\s*/);
  const numbers = parts.map(part => (part.trim() === '' ? NaN : Number(part)));
  if ((numbers.length === 1 || numbers.length === 2) && numbers.every(number => Number.isFinite(number) && number > 0)) {
    return `${numbers[0]} / ${numbers[1] ?? 1}`;
  }
  return DS_THUMB_DEFAULT_RATIO;
};

/** The words of a text: its runs of letters and digits, in the composed form (an accent with its letter). */
const wordsOf = (text: string): string[] => (text ?? '').normalize('NFC').match(/[\p{L}\p{N}]+/gu) ?? [];

/**
 * The initials of a label: the first letter of its first word, and of its last word when it has several, in upper case
 * (in the language `lang`). `The Matrix` gives `TM`, `Arte` gives `A`, `l'Été indien` gives `LI`; `''` without a letter.
 */
export const initialsOf = (label: string, lang?: string): string => {
  const words = wordsOf(label);
  if (!words.length) {
    return '';
  }
  const first = Array.from(words[0])[0];
  const letters = words.length > 1 ? first + Array.from(words[words.length - 1])[0] : first;
  try {
    return letters.toLocaleUpperCase(lang || undefined);
  } catch {
    // An invalid language tag.
    return letters.toUpperCase();
  }
};

/**
 * The hue of a label, from 0 to 359: an FNV-1a hash of its words, in lower case, so that a label always gets the same
 * color, and two labels different colors most of the time. `''` gives 0.
 */
export const hueOf = (label: string): number => {
  const text = wordsOf(label).join(' ').toLowerCase();
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0) % 360;
};
