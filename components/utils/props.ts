/**
 * Helpers for component properties, which come either from HTML attributes (strings) or from JavaScript.
 */

/** `undefined` gives `false`; a string is true when it is `'true'`, `''` or `'1'` (case-insensitive). */
export const isTrue = (prop: string | boolean): boolean =>
  typeof prop === 'undefined' ? false : typeof prop === 'boolean' ? prop : ['true', '', '1'].includes(prop.toLowerCase());

export const toNumber = (prop: string | number): number => (typeof prop === 'number' ? prop : parseInt(prop, 10));

export const toFloat = (prop: string | number): number => (typeof prop === 'number' ? prop : parseFloat(prop));

/** Splits a comma-separated string; an array is returned as is. */
export const toArray = <T = string>(prop: string | T[]): T[] => (typeof prop === 'string' ? (prop.split(',') as T[]) : prop);

/** Parses a JSON string (a non-string value is returned as is), then optionally returns its `rootKey` entry. */
export const fromJSON = <T = string | Record<string, unknown> | unknown[]>(prop: T, rootKey?: string) =>
  typeof prop === 'string' ? (rootKey ? JSON.parse(prop)[rootKey] : JSON.parse(prop)) : rootKey ? prop[rootKey] : prop;

/**
 * Builds a class map for the `class` attribute: `toClassList('ds-card', 'large,dark')`
 * gives `{ 'ds-card': true, '--large': true, '--dark': true }`.
 * @param mainClass one or more classes, as an array or a comma-separated string
 * @param mods one or more modifiers, each one becoming a `--<modifier>` class
 */
export const toClassList = (mainClass: string | string[], mods?: string | string[]): Record<string, boolean> => {
  const classList: Record<string, boolean> = {};
  toArray(mainClass).forEach(CSSClass => {
    const className = CSSClass.trim();
    if (className !== '') {
      classList[className] = true;
    }
  });
  if (mods) {
    toArray(mods).forEach(CSSClass => {
      if (CSSClass) {
        const className = CSSClass.trim();
        if (className !== '') {
          classList[`--${className}`] = true;
        }
      }
    });
  }
  return classList;
};

/** Serializes attributes to an HTML attribute string: `true` values give bare attributes, arrays are joined with commas. */
export const toString = (attributes: Record<string, unknown>): string =>
  Object.entries(attributes)
    .map(([key, value]) => `${key}${value !== true && value !== 'true' ? `="${Array.isArray(value) ? value.join(',') : value}"` : ''}`)
    .join(' ');
