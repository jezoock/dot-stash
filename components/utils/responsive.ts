import { Breakpoint, Breakpoints, RawBreakpoint, SassStyles } from './interfaces/sass-styles';

/**
 * Responsive helpers, and the bridge that reads the theme values written by Sass
 * (`@include ds-theme()`) as JSON in the `content` of `body::before`.
 */

/** Strips the quotes and escapes CSS adds around a `content` string, and all whitespace. */
export const removeQuotes = (quotedString: string): string => (typeof quotedString === 'string' ? quotedString.replace(/^['"]+|\s+|\\|(;\s?})+|['"]$/g, '') : quotedString);

/** Reads the theme JSON from `body::before` (`{}` when there is none). */
export const getStylesJSON = (): SassStyles => {
  let style = '{}';

  if (window?.getComputedStyle?.(document.body, '::before')) {
    const computedStyle = window.getComputedStyle(document.body, '::before');
    style = (computedStyle.content !== 'none' && computedStyle.content) || '{}';
  }
  return JSON.parse(removeQuotes(style));
};

export const isMobile = (): boolean => window.innerWidth < 768;
export const isTablet = (): boolean => window.innerWidth > 767 && window.innerWidth < 992;
export const isDesktop = (): boolean => window.innerWidth > 991;

/**
 * Turns the Sass breakpoints (label: minimum width) into limits (label: [min, max]).
 * The first breakpoint starts at 0 and the last one has no maximum.
 */
export const processBreakpoints = (breakpoints: RawBreakpoint): Breakpoints => {
  const newBreakpoints = Object.entries(breakpoints);
  const [firstBreakpointLabel, firstBreakpointValue] = newBreakpoints.shift();
  const processedBreakpoints: Breakpoints = { [firstBreakpointLabel]: [0, firstBreakpointValue] };
  let previousBreakpoint = '';
  newBreakpoints.map(([breakpointLabel, breakpointValue], index) => {
    processedBreakpoints[breakpointLabel] = [breakpointValue];
    if (index > 0) {
      processedBreakpoints[previousBreakpoint].push((breakpointValue as number) - 1);
    }
    previousBreakpoint = breakpointLabel;
  });
  return processedBreakpoints;
};

/**
 * Finds the breakpoint that contains a width.
 * @param rawBreakpoints breakpoints as returned by `processBreakpoints`
 * @param windowWidth width to look up, the window width by default
 * @returns the breakpoint label and limits
 */
export const getBreakpoint = (rawBreakpoints: Breakpoints, windowWidth = window.innerWidth): Breakpoint => {
  const currentBreakpoint: Breakpoint = {
    label: '',
    limits: [],
  };

  const breakpoints = Object.entries(rawBreakpoints);

  if (breakpoints?.length > 0) {
    const [maxBreakPointLabel, [maxBreakpointValue]] = breakpoints.pop();

    if (windowWidth >= maxBreakpointValue) {
      currentBreakpoint.label = maxBreakPointLabel;
      currentBreakpoint.limits = [maxBreakpointValue, windowWidth];
    } else {
      for (let index = 0; index < breakpoints.length; index++) {
        const loopBreakpoint = breakpoints[index];
        const [label, [min, max]] = loopBreakpoint;

        if (windowWidth < max) {
          currentBreakpoint.label = label;
          currentBreakpoint.limits = [min, max];
          break;
        }
      }
    }
  }

  return currentBreakpoint;
};

/**
 * Picks the parameters of the current breakpoint in a `{ [breakpointLabel]: params }` map,
 * or else those of the last breakpoint of the map whose maximum is below the current one.
 * @param breakpoints breakpoints as returned by `processBreakpoints`
 */
export const getParamsForBreakpoint = <T = Record<string, unknown>>(currentBreakpoint: Breakpoint, params: { [breakpointLabel: string]: T }, breakpoints: Breakpoints): T => {
  let currentBreakpointParams: T;
  const {
    label,
    limits: [, max],
  } = currentBreakpoint;

  if (params[label]) {
    currentBreakpointParams = params[label];
  } else {
    Object.keys(params).map(breakpointLabel => {
      if (breakpoints[breakpointLabel][1] < max) {
        currentBreakpointParams = params[breakpointLabel];
      }
    });
  }

  return currentBreakpointParams;
};
