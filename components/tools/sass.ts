import Breakpoint from '../interfaces/breakpoint';
import { SassStyles } from '../interfaces/sass-styles';

export const removeQuotes = (quotedString: string): string => {
  if (typeof quotedString === 'string') {
    quotedString = quotedString.replace(/^['"]+|\s+|\\|(;\s?})+|['"]$/g, '');
  }
  return quotedString;
};

export const getStylesJSON = (): SassStyles => {
  let style = '{}';

  if (window?.getComputedStyle?.(document.body, '::before')) {
    const computedStyle = window.getComputedStyle(document.body, '::before');
    style = (computedStyle.content !== 'none' && computedStyle.content) || '{}';
  }
  return JSON.parse(removeQuotes(style));
};

/**
 * Get the current breakpoint
 * @param rawBreakpoints JSON Object containings all breakpoints
 * @param isMobileFirst
 * @returns current breakpoint ( label & limits )
 */
export const getBreakpoint = (rawBreakpoints: Breakpoint[], isMobileFirst?: boolean): Breakpoint => {
  const currentBreakpoint: Breakpoint = {
    label: '',
    limits: [],
  };

  const windowWidth = window.innerWidth;
  const breakpoints = rawBreakpoints.filter(breakpoint => {
    const [label] = Object.keys(breakpoint);
    return label.indexOf('max') > -1;
  });

  if (breakpoints?.length) {
    const [minBreakpoint] = Object.values(breakpoints.shift() as Breakpoint);
    const [maxBreakpoint] = Object.values(breakpoints.pop() as Breakpoint);

    if (windowWidth < minBreakpoint) {
      currentBreakpoint.label = 'min';
      currentBreakpoint.limits = [0, minBreakpoint];
    } else if (windowWidth >= maxBreakpoint) {
      currentBreakpoint.label = 'max';
      currentBreakpoint.limits = [maxBreakpoint, maxBreakpoint];
    } else {
      for (let index = 0; index < breakpoints.length; index++) {
        const loopBreakpoint = breakpoints[index];
        const [label] = Object.keys(loopBreakpoint);
        const [max] = Object.values(loopBreakpoint);
        if (windowWidth < max) {
          const [min] = Object.values(rawBreakpoints[index * 2]);
          currentBreakpoint.label = label.split('-')[0];
          currentBreakpoint.limits = isMobileFirst ? [min] : [min, max];
          break;
        }
      }
    }
  }

  return currentBreakpoint;
};
