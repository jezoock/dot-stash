import { Breakpoint, Breakpoints, RawBreakpoint, SassStyles } from './interfaces/sass-styles';

/**
 * Responsive helpers, and the bridge that reads the theme values written by Sass
 * (`@include ds-theme()`) as JSON in the `content` of `body::before`.
 */

/** CSS string escapes: `\"`, `\\`, `\'`, and hexadecimal code points such as `\a ` (a line feed). */
const CSS_ESCAPE = /\\(?:([0-9a-fA-F]{1,6})[ \t\n\r\f]?|([\s\S]))/g;

/**
 * Turns a CSS string, as `getComputedStyle(...).content` returns it (`"{ \"a\": \"x y\" }"`),
 * back into its text (`{ "a": "x y" }`): strips the surrounding quotes and decodes the CSS escapes.
 * The whitespace inside is kept. A value that is not a quoted string is returned trimmed.
 */
export const removeQuotes = (quotedString: string): string => {
  if (typeof quotedString !== 'string') {
    return quotedString;
  }

  const value = quotedString.trim();
  const quote = value[0];

  if (value.length < 2 || (quote !== '"' && quote !== "'") || value[value.length - 1] !== quote) {
    return value;
  }

  return value.slice(1, -1).replace(CSS_ESCAPE, (_, codePoint: string, character: string) => {
    if (codePoint) {
      const code = parseInt(codePoint, 16);
      // As in CSS, NULL, surrogates and out-of-range values give the replacement character.
      return code === 0 || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff) ? '�' : String.fromCodePoint(code);
    }
    // An escaped line break continues the string on the next line.
    return character === '\n' ? '' : character;
  });
};

/**
 * Reads the theme JSON from the `content` of `body::before` (written by `@include ds-theme()`).
 * Returns `{}` when the theme stylesheet is not loaded, and also, with a warning, when the content is not JSON.
 */
export const getStylesJSON = (): SassStyles => {
  const content = window?.getComputedStyle?.(document.body, '::before')?.content;

  if (!content || content === 'none' || content === 'normal') {
    return {} as SassStyles;
  }

  try {
    return JSON.parse(removeQuotes(content));
  } catch {
    console.warn(`[ds] getStylesJSON: the content of body::before is not the theme JSON: ${content}`);
    return {} as SassStyles;
  }
};

export const isMobile = (): boolean => window.innerWidth < 768;
export const isTablet = (): boolean => window.innerWidth > 767 && window.innerWidth < 992;
export const isDesktop = (): boolean => window.innerWidth > 991;

/**
 * Turns the Sass breakpoints (label: minimum width in px) into limits (label: [min, max], both included),
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
