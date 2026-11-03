/**
 * The texts that components give to assistive technologies, from templates that a project can translate.
 */

/** A label template with its values: `formatLabel('{index} of {count}', { index: 2, count: 5 })` gives `2 of 5`. */
export const formatLabel = (template: string, values: Record<string, string | number>): string =>
  String(template ?? '').replace(/\{(\w+)\}/g, (match, name: string) => (name in values ? String(values[name]) : match));
