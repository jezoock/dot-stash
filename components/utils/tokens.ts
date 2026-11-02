import { RawBreakpoint } from './interfaces/breakpoints';

/**
 * Reads the design tokens the theme stylesheet declares as CSS custom properties on `:root`
 * (`--ds-color-primary-base`, `--ds-space-4`, `--ds-bp-md`…: `@include ds-tokens()`, see the README),
 * and the theme breakpoints among them.
 */

const PREFIX = '--ds-';

/** The custom property that lists the breakpoint labels, from the smallest to the largest: `xxs xs sm md lg xl xxl`. */
const BREAKPOINT_LABELS = 'bp-labels';

/** `color-primary-base` and `--ds-color-primary-base` both give `--ds-color-primary-base`. */
const toPropertyName = (name: string): string => {
  const trimmedName = String(name ?? '').trim();
  return trimmedName.startsWith(PREFIX) ? trimmedName : `${PREFIX}${trimmedName}`;
};

/** A width in px, unitless or in `px` (`'992px'` and `'992'` give `992`); `undefined` for anything else. */
const toPx = (value: string): number | undefined => {
  const match = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)(px)?$/i.exec(value);
  return match ? Number(match[1]) : undefined;
};

/**
 * The value of a token, as the theme declares it (custom properties are inherited: an element gets the value of its scope).
 * @param name the token name, with or without the `--ds-` prefix: `getToken('color-primary-base')`, `getToken('--ds-space-4')`
 * @param element where to read it, `document.documentElement` (`:root`) by default
 * @returns the computed value of `--ds-<name>`, trimmed (`'#2563eb'`, `'992px'`); `''` when it is not declared,
 * e.g. while the theme stylesheet is not loaded
 */
export const getToken = (name: string, element?: Element): string => {
  const target = element ?? (typeof document === 'undefined' ? undefined : document.documentElement);

  if (!target || typeof window === 'undefined' || typeof window.getComputedStyle !== 'function') {
    return '';
  }

  // getComputedStyle() can give null (old Firefox, in a hidden iframe).
  return (window.getComputedStyle(target)?.getPropertyValue(toPropertyName(name)) ?? '').trim();
};

/**
 * The theme breakpoints, read from the custom properties: `--ds-bp-labels` lists the labels (identifiers separated by
 * whitespace), and `--ds-bp-<label>` gives the minimum width of each one, in px.
 * - A label whose width is missing or not in px (unitless or `px`) is left out, with one warning that names them.
 * - Without `--ds-bp-labels` (theme stylesheet not loaded yet), returns `{}`, with one warning.
 * @param element where to read them, `document.documentElement` (`:root`) by default
 * @returns label: minimum width in px, sorted by width: `{ xxs: 360, xs: 576, sm: 768, md: 992, lg: 1200, xl: 1400, xxl: 1600 }`
 */
export const getBreakpoints = (element?: Element): RawBreakpoint => {
  const labels = getToken(BREAKPOINT_LABELS, element)
    .split(/[\s,]+/)
    .filter((label, index, allLabels) => label !== '' && allLabels.indexOf(label) === index);

  if (!labels.length) {
    console.warn(
      `[ds] getBreakpoints: no ${toPropertyName(BREAKPOINT_LABELS)} custom property, so no breakpoints: the theme stylesheet is not loaded (yet), or it does not declare its tokens (@include ds-tokens()).`,
    );
    return {};
  }

  const skipped: string[] = [];
  const breakpoints = labels
    .map((label): [string, number | undefined] => {
      const value = getToken(`bp-${label}`, element);
      const width = toPx(value);
      if (width === undefined) {
        skipped.push(value ? `${label} (${value})` : `${label} (missing)`);
      }
      return [label, width];
    })
    .filter(([, width]) => width !== undefined)
    .sort(([, a], [, b]) => a - b);

  if (skipped.length) {
    console.warn(`[ds] getBreakpoints: breakpoint(s) without a width in px in their ${PREFIX}bp-<label> custom property, left out: ${skipped.join(', ')}`);
  }

  return breakpoints.reduce((rawBreakpoints: RawBreakpoint, [label, width]) => ({ ...rawBreakpoints, [label]: width }), {});
};
