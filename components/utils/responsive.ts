import { Breakpoint, Breakpoints, RawBreakpoint } from './interfaces/breakpoints';
import { getToken } from './tokens';

/**
 * Responsive helpers. The theme breakpoints come from its custom properties: `tokens.getBreakpoints()`.
 * The viewport is tested with media queries (`matchMedia()`), as the theme stylesheets do: a breakpoint change is known at
 * once, from the `change` event of a `MediaQueryList`, and at the exact width, fractional when the page is zoomed.
 */

/** The minimum width of a theme breakpoint (`--ds-bp-<label>`, in px), or `fallback` without the theme. */
const themeWidth = (label: string, fallback: number): number => {
  const width = parseFloat(getToken(`bp-${label}`));
  return Number.isFinite(width) ? width : fallback;
};

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

/** The `matchMedia()` of the window, `undefined` outside a browser (a server, or a test environment without it). */
const getMatchMedia = (): ((query: string) => MediaQueryList) | undefined =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? (query: string) => window.matchMedia(query) : undefined;

/**
 * The media query of the viewport widths from `min` px (included) to `max` px (excluded): `(min-width: 768px)`,
 * `(width < 992px)` or `(min-width: 768px) and (width < 992px)`; `all` without limit (a `min` of 0 or less is no limit).
 * The maximum uses the range syntax (Media Queries level 4), so that two ranges that meet leave no gap and do not overlap,
 * at the fractional widths of a zoomed page too (`max-width: 991px` would match neither at 991.5 px). These are the media
 * queries the `break-p()` mixin writes in the themes: `break-p(md)` is `(min-width: 992px)`, `break-p(null, md)` is
 * `(width < 992px)`. A breakpoint `[min, max]` (both included, as `processBreakpoints()` gives them) is
 * `widthQuery(min, max + 1)`.
 */
export const widthQuery = (min?: number, max?: number): string => {
  const parts = [];
  if (isNumber(min) && min > 0) {
    parts.push(`(min-width: ${min}px)`);
  }
  if (isNumber(max)) {
    parts.push(`(width < ${max}px)`);
  }
  return parts.length ? parts.join(' and ') : 'all';
};

/**
 * Whether the viewport width is from `min` px (included) to `max` px (excluded): the media query of `widthQuery()`.
 * Without `matchMedia()` (not a browser), compares `window.innerWidth`.
 */
export const matchesWidth = (min?: number, max?: number): boolean => {
  const matchMedia = getMatchMedia();
  if (matchMedia) {
    return matchMedia(widthQuery(min, max)).matches;
  }
  const width = typeof window === 'undefined' ? 0 : window.innerWidth;
  return (!isNumber(min) || width >= min) && (!isNumber(max) || width < max);
};

/** A media query being watched (`watchMedia()`). */
export interface MediaWatch {
  /** Whether the media query matches now. */
  readonly matches: boolean;
  /** Stops watching: removes the listener. */
  stop(): void;
}

/**
 * Watches a media query: calls `listener` each time it starts or stops matching (the `change` event of its
 * `MediaQueryList`), with whether it matches. Without `matchMedia()` (not a browser), it never matches and never calls it.
 * @returns whether it matches now, and `stop()`
 */
export const watchMedia = (query: string, listener: (matches: boolean) => void): MediaWatch => {
  const list = getMatchMedia()?.(query);

  if (!list) {
    return { matches: false, stop: () => undefined };
  }

  const changeHandler = () => listener(list.matches);
  list.addEventListener('change', changeHandler);

  return {
    get matches() {
      return list.matches;
    },
    stop: () => list.removeEventListener('change', changeHandler),
  };
};

/** Whether an event is the `load` event of a stylesheet `<link>`: a theme stylesheet that loaded. */
export const isStylesheetLoad = (event: Event): boolean => {
  const target = event.target as Element;
  return target?.nodeName?.toLowerCase() === 'link' && /(^|\s)stylesheet(\s|$)/i.test(target.getAttribute?.('rel') ?? '');
};

/** A theme breakpoint being watched (`watchThemeBreakpoint()`). */
export interface ThemeBreakpointWatch extends MediaWatch {
  /** The width it watches, in px: the theme breakpoint, or the fallback. */
  readonly width: number;
}

/**
 * Watches the viewport from a theme breakpoint on: `matches` from the width of `--ds-bp-<label>` (`fallback` px without
 * the theme), the media query of `break-p(<label>)`; `listener` is called with `matches` each time it changes. The width is
 * read again when a stylesheet `<link>` of the document loads (a theme loaded after the component, or switched): when it
 * changed, the media query follows, and `listener` is called if `matches` changed with it.
 * @param label the breakpoint label: `md`
 * @param fallback its width in px without the theme: `992`
 * @returns whether the viewport is from the breakpoint on now, the width watched, and `stop()`
 */
export const watchThemeBreakpoint = (label: string, fallback: number, listener: (matches: boolean) => void): ThemeBreakpointWatch => {
  let width = themeWidth(label, fallback);
  let watch = watchMedia(widthQuery(width), listener);

  const stylesheetLoadHandler = (event: Event) => {
    const newWidth = isStylesheetLoad(event) ? themeWidth(label, fallback) : width;
    if (newWidth === width) {
      return;
    }
    const matches = watch.matches;
    watch.stop();
    width = newWidth;
    watch = watchMedia(widthQuery(width), listener);
    if (watch.matches !== matches) {
      listener(watch.matches);
    }
  };
  // `load` does not bubble: listened to on the document, in the capture phase.
  const doc = typeof document === 'undefined' ? undefined : document;
  doc?.addEventListener('load', stylesheetLoadHandler, true);

  return {
    get matches() {
      return watch.matches;
    },
    get width() {
      return width;
    },
    stop: () => {
      watch.stop();
      doc?.removeEventListener('load', stylesheetLoadHandler, true);
    },
  };
};

/** Below the `sm` breakpoint of the theme (768 px without the theme): the media query `(width < 768px)`. */
export const isMobile = (): boolean => matchesWidth(undefined, themeWidth('sm', 768));
/** From the `sm` breakpoint of the theme to below its `md` breakpoint (768 to 991 px without the theme). */
export const isTablet = (): boolean => matchesWidth(themeWidth('sm', 768), themeWidth('md', 992));
/** From the `md` breakpoint of the theme (992 px without the theme): the media query `(min-width: 992px)`. */
export const isDesktop = (): boolean => matchesWidth(themeWidth('md', 992));

/**
 * Turns the theme breakpoints (label: minimum width in px, as `tokens.getBreakpoints()` returns them) into limits (label: [min, max], both included),
 * with the mobile-first semantics of the `break-p` Sass mixin:
 * - each label starts at its value and ends at the next value - 1;
 * - the first label also covers the smaller widths: it starts at 0;
 * - the last label has no maximum: its limits are `[min]`.
 *
 * With the theme map: `{ xxs: [0, 575], xs: [576, 767], sm: [768, 991], …, xl: [1400, 1599], xxl: [1600] }`.
 * The labels are sorted by value. Returns `{}` without breakpoints.
 * At a fractional width (a zoomed page), a label ends below the next value: `xxs` covers 575.5 px, as `(width < 576px)`.
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

/** The breakpoint of a label, or the empty breakpoint (no label, no limits). */
const toBreakpoint = (breakpoints: Breakpoints, label: string | undefined): Breakpoint =>
  label === undefined ? { label: '', limits: [] } : { label, limits: [...breakpoints[label]] };

/** Whether two breakpoints have the same label and limits. */
export const isSameBreakpoint = (a: Breakpoint | undefined, b: Breakpoint | undefined): boolean => a?.label === b?.label && String(a?.limits) === String(b?.limits);

/**
 * Finds the breakpoint that contains a width: the largest one whose minimum is not above it.
 * @param rawBreakpoints breakpoints as returned by `processBreakpoints`
 * @param windowWidth width to look up, in px. Without it, the breakpoint of the viewport, from the media queries of the
 * minimums (`(min-width: 768px)`…), as the theme stylesheets and `ds-rsp` see it (at a fractional width too); without
 * `matchMedia()` (not a browser), from `window.innerWidth`
 * @returns the breakpoint label and limits (`[min, max]`, or `[min]` for the last one);
 * an empty label and no limits when there is no breakpoint
 */
export const getBreakpoint = (rawBreakpoints: Breakpoints, windowWidth?: number): Breakpoint => {
  const matchMedia = windowWidth === undefined ? getMatchMedia() : undefined;
  const width = windowWidth ?? (typeof window === 'undefined' ? 0 : window.innerWidth);
  const label = sortedLabels(rawBreakpoints)
    .filter(breakpointLabel => {
      const [min] = rawBreakpoints[breakpointLabel];
      return matchMedia ? min <= 0 || matchMedia(widthQuery(min)).matches : min <= width;
    })
    .pop();

  return toBreakpoint(rawBreakpoints, label);
};

/** The breakpoint of the viewport being watched (`watchBreakpoint()`). */
export interface BreakpointWatch {
  /** The breakpoint of the viewport now (an empty label and no limits without breakpoints). */
  readonly current: Breakpoint;
  /** Stops watching: removes the listeners of every media query. */
  stop(): void;
}

/**
 * Watches the breakpoint of the viewport: one media query per boundary, the minimum width of each breakpoint (but a
 * minimum of 0: the first breakpoint, which starts at 0), `(min-width: 576px)`… (`matchMedia()`), and `listener` is called
 * with the new breakpoint when it changes: at once, when the viewport crosses a boundary (once, when it crosses several),
 * and never when it is resized within a breakpoint. The breakpoint is the largest one whose minimum matches, as
 * `getBreakpoint()` finds it.
 * @param breakpoints breakpoints as returned by `processBreakpoints`
 * @returns the current breakpoint, and `stop()`
 */
export const watchBreakpoint = (breakpoints: Breakpoints, listener: (breakpoint: Breakpoint) => void): BreakpointWatch => {
  const labels = sortedLabels(breakpoints);
  const watches = new Map<number, MediaWatch>();

  const findBreakpoint = (): Breakpoint =>
    toBreakpoint(
      breakpoints,
      labels
        .filter(label => {
          const [min] = breakpoints[label];
          return min <= 0 || watches.get(min)?.matches;
        })
        .pop(),
    );

  let current: Breakpoint;

  // Every list is up to date when the first change event comes (`matches` is the state of the viewport now): the first one
  // gives the new breakpoint, the others find no change.
  const changeHandler = () => {
    const breakpoint = findBreakpoint();
    if (!isSameBreakpoint(breakpoint, current)) {
      current = breakpoint;
      listener(breakpoint);
    }
  };

  new Set(labels.map(label => breakpoints[label][0]).filter(min => min > 0)).forEach(min => watches.set(min, watchMedia(widthQuery(min), changeHandler)));

  current = findBreakpoint();

  return {
    get current() {
      return current;
    },
    stop: () => watches.forEach(watch => watch.stop()),
  };
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
