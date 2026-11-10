/**
 * The texts that components give to assistive technologies, from templates that a project can translate.
 */

/** A label template with its values: `formatLabel('{index} of {count}', { index: 2, count: 5 })` gives `2 of 5`. */
export const formatLabel = (template: string, values: Record<string, string | number>): string =>
  String(template ?? '').replace(/\{(\w+)\}/g, (match, name: string) => (name in values ? String(values[name]) : match));

/** The plural categories of `Intl.PluralRules`. */
export type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

/**
 * A label with a count: one template for every count, or one template per plural category of the language
 * (`{"one": "{count} character", "other": "{count} characters"}`; `other` is the fallback of the missing ones).
 */
export type PluralLabel = string | Partial<Record<PluralCategory, string>>;

/** `Intl.PluralRules` (not in the ES2017 library of the configuration; every browser of the components has it). */
type PluralRulesConstructor = new (locale?: string) => { select(count: number): string };

/** The plural category of a count in a language (`en` without one, or with a language the browser does not know). */
const pluralCategory = (count: number, lang?: string): PluralCategory => {
  const PluralRules = (Intl as unknown as { PluralRules?: PluralRulesConstructor }).PluralRules;
  if (!PluralRules) {
    return count === 1 ? 'one' : 'other';
  }
  try {
    return new PluralRules(lang || 'en').select(count) as PluralCategory;
  } catch {
    // An invalid language tag.
    return new PluralRules('en').select(count) as PluralCategory;
  }
};

/**
 * The text of a label with a count, in a language (`lang`, as a `lang` attribute gives it): the template of the plural
 * category of `count` (else the `other` one), with `{count}` and the other values replaced.
 * `formatPluralLabel({ one: '{count} character', other: '{count} characters' }, 1, 'en')` gives `1 character`.
 */
export const formatPluralLabel = (label: PluralLabel, count: number, lang?: string, values: Record<string, string | number> = {}): string => {
  const template = typeof label === 'object' && label !== null ? (label[pluralCategory(count, lang)] ?? label.other) : (label as string | undefined);
  return formatLabel(template, { ...values, count });
};
