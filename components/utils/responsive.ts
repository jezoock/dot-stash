import { Breakpoint, Breakpoints, RawBreakpoint } from './interfaces/breakpoints';
import { getToken } from './tokens';

/**
 * Responsive helpers. The theme breakpoints come from its custom properties: `tokens.getBreakpoints()`.
 */

/** The minimum width of a theme breakpoint (`--ds-bp-<label>`, in px), or `fallback` without the theme. */
const themeWidth = (label: string, fallback: number): number => {
  const width = parseFloat(getToken(`bp-${label}`));
  return Number.isFinite(width) ? width : fallback;
};

/** Below the `sm` breakpoint of the theme (768 px without the theme). */
export const isMobile = (): boolean => window.innerWidth < themeWidth('sm', 768);
/** From the `sm` breakpoint of the theme to below its `md` breakpoint (768 to 991 px without the theme). */
export const isTablet = (): boolean => window.innerWidth >= themeWidth('sm', 768) && window.innerWidth < themeWidth('md', 992);
/** From the `md` breakpoint of the theme (992 px without the theme). */
export const isDesktop = (): boolean => window.innerWidth >= themeWidth('md', 992);

/**
 * Turns the theme breakpoints (label: minimum width in px, as `tokens.getBreakpoints()` returns them) into limits (label: [min, max], both included),
 * with the mobile-first semantics of the `break-p` Sass mixin:
 * - each label starts at its value and ends at the next value - 1;
 * - the first label also covers the smaller widths: it starts at 0;
 * - the last label has no maximum: its limits are `[min]`.
 *
 * With the theme map: `{ xxs: [0, 575], xs: [576, 767], sm: [768, 991], …, xl: [1400, 1599], xxl: [1600] }`.
 * The labels are sorted by value. Returns `{}` without breakpoints.
 */
export const processBreakpoints = (breakpoints: RawBreakpoint): Breakpoints => {
  const sortedBreakpoints = Object.entries(breakpoints ?? {})
    .map(([label, value]): [string, number] => [label, Number(value)])
    .sort(([, a], [, b]) => a - b);
  const processedBreakpoints: Breakpoints = {};

  sortedBreakpoints.forEach(([label, value], index) => {
    const min = index === 0 ? 0 : value;
    const next = sortedBreakpoints[index + 1];
    processedBreakpoints[label] = next ? [min, next[1] - 1] : [min];
  });

  return processedBreakpoints;
};

/** The labels of processed breakpoints, from the smallest to the largest. */
const sortedLabels = (breakpoints: Breakpoints): string[] =>
  Object.entries(breakpoints ?? {})
    .sort(([, [a]], [, [b]]) => a - b)
    .map(([label]) => label);

/**
 * Finds the breakpoint that contains a width: the largest one whose minimum is not above it.
 * @param rawBreakpoints breakpoints as returned by `processBreakpoints`
 * @param windowWidth width to look up, the window width by default
 * @returns the breakpoint label and limits (`[min, max]`, or `[min]` for the last one);
 * an empty label and no limits when there is no breakpoint
 */
export const getBreakpoint = (rawBreakpoints: Breakpoints, windowWidth = window.innerWidth): Breakpoint => {
  const label = sortedLabels(rawBreakpoints)
    .filter(breakpointLabel => rawBreakpoints[breakpointLabel][0] <= windowWidth)
    .pop();

  return label === undefined ? { label: '', limits: [] } : { label, limits: [...rawBreakpoints[label]] };
};

/**
 * Picks, in a `{ [breakpointLabel]: params }` map, the parameters of the current breakpoint or else,
 * mobile-first, those of the nearest smaller breakpoint that has some. Returns `undefined` when none has.
 * Labels that are not breakpoints are ignored, with a warning.
 * @param breakpoints breakpoints as returned by `processBreakpoints`
 */
export const getParamsForBreakpoint = <T = Record<string, unknown>>(currentBreakpoint: Breakpoint, params: { [breakpointLabel: string]: T }, breakpoints: Breakpoints): T => {
  const labels = sortedLabels(breakpoints);
  const unknownLabels = Object.keys(params ?? {}).filter(label => !labels.includes(label));

  if (unknownLabels.length) {
    console.warn(`[ds] getParamsForBreakpoint: unknown breakpoint label(s) ignored: ${unknownLabels.join(', ')} (breakpoints: ${labels.join(', ')})`);
  }

  for (let index = labels.indexOf(currentBreakpoint?.label); index >= 0; index--) {
    const breakpointParams = params?.[labels[index]];
    if (breakpointParams !== undefined && breakpointParams !== null) {
      return breakpointParams;
    }
  }

  return undefined;
};
