import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import {
  getBreakpoint,
  getParamsForBreakpoint,
  isDesktop,
  isMobile,
  isSameBreakpoint,
  isStylesheetLoad,
  isTablet,
  matchesWidth,
  processBreakpoints,
  watchBreakpoint,
  watchMedia,
  watchThemeBreakpoint,
  widthQuery,
} from './responsive';
import { fakeMatchMedia, mockTokens } from '../../test/helpers';

/** The theme breakpoints (scss/engine/variables/_breakpoints.scss), as tokens.getBreakpoints() reads them. */
const THEME_BREAKPOINTS = { xxs: 360, xs: 576, sm: 768, md: 992, lg: 1200, xl: 1400, xxl: 1600 };

describe('responsive', () => {
  let tokens: Record<string, string>;
  let matchMedia: typeof window.matchMedia;

  beforeEach(() => {
    matchMedia = window.matchMedia;
    tokens = {};
    // The theme custom properties: the mock DOM computes no style.
    mockTokens(() => tokens);
  });

  afterEach(() => {
    window.matchMedia = matchMedia;
    vi.restoreAllMocks();
  });

  describe('widthQuery', () => {
    it.each([
      [[768, undefined], '(min-width: 768px)'],
      [[undefined, 992], '(width < 992px)'],
      [[768, 992], '(min-width: 768px) and (width < 992px)'],
      [[0, 576], '(width < 576px)'],
      [[575.5, undefined], '(min-width: 575.5px)'],
      [[undefined, undefined], 'all'],
      [[0, undefined], 'all'],
      [[NaN, Infinity], 'all'],
    ])('%o gives %j', ([min, max], query) => {
      expect(widthQuery(min, max)).toBe(query);
    });
  });

  describe('matchesWidth', () => {
    it('evaluates the media query of the range: the minimum included, the maximum excluded', () => {
      const media = fakeMatchMedia(767.5);

      expect(matchesWidth(undefined, 768)).toBe(true);
      expect(matchesWidth(768)).toBe(false);
      media.resize(768);
      expect(matchesWidth(768, 992)).toBe(true);
      expect(matchesWidth(undefined, 768)).toBe(false);
      expect(media.matchMedia).toHaveBeenCalledWith('(min-width: 768px) and (width < 992px)');
    });

    it('compares window.innerWidth without matchMedia', () => {
      const innerWidth = window.innerWidth;
      (window as { matchMedia?: unknown }).matchMedia = undefined;
      try {
        (window as { innerWidth: number }).innerWidth = 800;
        expect([matchesWidth(768, 992), matchesWidth(992), matchesWidth(undefined, 768)]).toEqual([true, false, false]);
      } finally {
        (window as { innerWidth: number }).innerWidth = innerWidth;
      }
    });
  });

  describe('isMobile, isTablet, isDesktop', () => {
    const at = (width: number) => {
      fakeMatchMedia(width);
      return [isMobile(), isTablet(), isDesktop()];
    };

    it.each([
      [767, [true, false, false]],
      [767.5, [true, false, false]],
      [768, [false, true, false]],
      [991, [false, true, false]],
      [991.9, [false, true, false]],
      [992, [false, false, true]],
    ])('without the theme, uses 768 and 992 px: width %j', (width, expected) => {
      expect(at(width)).toEqual(expected);
    });

    it.each([
      [599, [true, false, false]],
      [600, [false, true, false]],
      [1023, [false, true, false]],
      [1024, [false, false, true]],
    ])('uses the sm and md breakpoints of the theme (--ds-bp-sm: 600px, --ds-bp-md: 1024px): width %j', (width, expected) => {
      tokens = { '--ds-bp-sm': '600px', '--ds-bp-md': ' 1024px' };
      expect(at(width)).toEqual(expected);
    });

    it('reads the viewport with the media queries of the theme breakpoints', () => {
      const media = fakeMatchMedia(800);
      tokens = { '--ds-bp-sm': '600px', '--ds-bp-md': '1024px' };

      isMobile();
      isTablet();
      isDesktop();

      expect(media.matchMedia.mock.calls.map(([query]) => query)).toEqual(['(width < 600px)', '(min-width: 600px) and (width < 1024px)', '(min-width: 1024px)']);
    });
  });

  describe('watchMedia', () => {
    it('calls the listener each time the media query starts or stops matching, until stop()', () => {
      const media = fakeMatchMedia(500);
      const listener = vi.fn();
      const watch = watchMedia('(min-width: 768px)', listener);

      expect(watch.matches).toBe(false);
      media.resize(700);
      expect(listener).not.toHaveBeenCalled();
      media.resize(800);
      expect(listener).toHaveBeenLastCalledWith(true);
      expect(watch.matches).toBe(true);
      media.resize(767);
      expect(listener).toHaveBeenLastCalledWith(false);
      expect(listener).toHaveBeenCalledTimes(2);

      watch.stop();
      expect(media.watched()).toEqual([]);
      media.resize(900);
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('never matches without matchMedia', () => {
      (window as { matchMedia?: unknown }).matchMedia = undefined;
      const watch = watchMedia('(min-width: 768px)', vi.fn());

      expect(watch.matches).toBe(false);
      expect(() => watch.stop()).not.toThrow();
    });
  });

  describe('watchThemeBreakpoint', () => {
    const loadStylesheet = () => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'stylesheet');
      document.head.appendChild(link);
      // The load event does not bubble: the mock DOM has no capture phase, it bubbles up to the document here.
      link.dispatchEvent(new Event('load', { bubbles: true }));
      link.remove();
    };

    it('watches the viewport from the theme breakpoint, or from the fallback without the theme', () => {
      const media = fakeMatchMedia(1000);
      const listener = vi.fn();

      const fallback = watchThemeBreakpoint('md', 992, listener);
      expect([fallback.width, fallback.matches]).toEqual([992, true]);
      expect(media.watched()).toEqual(['(min-width: 992px)']);
      fallback.stop();

      tokens = { '--ds-bp-md': '1024px' };
      const watch = watchThemeBreakpoint('md', 992, listener);
      expect([watch.width, watch.matches]).toEqual([1024, false]);
      media.resize(1024);
      expect(listener).toHaveBeenCalledWith(true);
      watch.stop();
      expect(media.watched()).toEqual([]);
    });

    it('reads the breakpoint again when a stylesheet <link> loads, and tells when it changes the state', () => {
      const media = fakeMatchMedia(1000);
      const listener = vi.fn();
      const watch = watchThemeBreakpoint('md', 992, listener);

      // A theme with md at 1024 px: from desktop (1000 >= 992) to below it.
      tokens = { '--ds-bp-md': '1024px' };
      document.body.dispatchEvent(new Event('load', { bubbles: true }));
      expect(watch.width).toBe(992);
      loadStylesheet();
      expect(watch.width).toBe(1024);
      expect(listener).toHaveBeenCalledWith(false);
      expect(media.watched()).toEqual(['(min-width: 1024px)']);

      // The same width: nothing changes.
      loadStylesheet();
      expect(listener).toHaveBeenCalledTimes(1);

      watch.stop();
      tokens = { '--ds-bp-md': '900px' };
      loadStylesheet();
      expect(watch.width).toBe(1024);
      expect(media.watched()).toEqual([]);
    });
  });

  describe('processBreakpoints', () => {
    it('gives each label [its value, next value - 1], from 0 for the first one and without maximum for the last one', () => {
      expect(processBreakpoints(THEME_BREAKPOINTS)).toEqual({
        xxs: [0, 575],
        xs: [576, 767],
        sm: [768, 991],
        md: [992, 1199],
        lg: [1200, 1399],
        xl: [1400, 1599],
        xxl: [1600],
      });
    });

    it('sorts the labels by value', () => {
      expect(processBreakpoints({ md: 992, xs: 576, sm: 768 })).toEqual({ xs: [0, 767], sm: [768, 991], md: [992] });
    });

    it('handles a single breakpoint', () => {
      expect(processBreakpoints({ all: 0 })).toEqual({ all: [0] });
    });

    it('returns {} without breakpoints', () => {
      expect(processBreakpoints(undefined)).toEqual({});
      expect(processBreakpoints({})).toEqual({});
    });
  });

  describe('getBreakpoint', () => {
    const breakpoints = processBreakpoints(THEME_BREAKPOINTS);

    it.each([
      [0, 'xxs', [0, 575]],
      [359, 'xxs', [0, 575]],
      [360, 'xxs', [0, 575]],
      [575, 'xxs', [0, 575]],
      [575.5, 'xxs', [0, 575]],
      [576, 'xs', [576, 767]],
      [767, 'xs', [576, 767]],
      [768, 'sm', [768, 991]],
      [991, 'sm', [768, 991]],
      [992, 'md', [992, 1199]],
      [1199, 'md', [992, 1199]],
      [1200, 'lg', [1200, 1399]],
      [1399, 'lg', [1200, 1399]],
      [1400, 'xl', [1400, 1599]],
      [1599, 'xl', [1400, 1599]],
      [1600, 'xxl', [1600]],
      [3000, 'xxl', [1600]],
    ])('width %j is %j %j', (width, label, limits) => {
      expect(getBreakpoint(breakpoints, width)).toEqual({ label, limits });
    });

    it.each([
      [575, 'xxs'],
      [575.9, 'xxs'],
      [576, 'xs'],
      [991.5, 'sm'],
      [992, 'md'],
      [1599.99, 'xl'],
      [1600, 'xxl'],
    ])('without a width, reads the viewport with the media queries of the minimums: %j is %j', (width, label) => {
      const media = fakeMatchMedia(width);

      expect(getBreakpoint(breakpoints).label).toBe(label);
      expect(media.matchMedia).toHaveBeenCalledWith('(min-width: 576px)');
    });

    it('reads the window width without matchMedia', () => {
      const innerWidth = window.innerWidth;
      (window as { matchMedia?: unknown }).matchMedia = undefined;
      try {
        (window as { innerWidth: number }).innerWidth = 800;
        expect(getBreakpoint(breakpoints).label).toBe('sm');
      } finally {
        (window as { innerWidth: number }).innerWidth = innerWidth;
      }
    });

    it('returns an empty label without breakpoints', () => {
      expect(getBreakpoint({}, 500)).toEqual({ label: '', limits: [] });
      fakeMatchMedia(500);
      expect(getBreakpoint({})).toEqual({ label: '', limits: [] });
    });
  });

  describe('watchBreakpoint', () => {
    const breakpoints = processBreakpoints(THEME_BREAKPOINTS);

    it('watches one media query per boundary: the minimum of each breakpoint but the first one', () => {
      const media = fakeMatchMedia(1000);
      const watch = watchBreakpoint(breakpoints, vi.fn());

      expect(media.watched()).toEqual(['(min-width: 576px)', '(min-width: 768px)', '(min-width: 992px)', '(min-width: 1200px)', '(min-width: 1400px)', '(min-width: 1600px)']);
      expect(watch.current).toEqual({ label: 'md', limits: [992, 1199] });

      watch.stop();
      expect(media.watched()).toEqual([]);
    });

    it.each([
      [575, 'xxs'],
      [575.5, 'xxs'],
      [576, 'xs'],
      [767.99, 'xs'],
      [768, 'sm'],
      [991, 'sm'],
      [992, 'md'],
      [1199, 'md'],
      [1200, 'lg'],
      [1399.5, 'lg'],
      [1400, 'xl'],
      [1599, 'xl'],
      [1600, 'xxl'],
    ])('gives the breakpoint of getBreakpoint() at each boundary: %j is %j', (width, label) => {
      fakeMatchMedia(width);
      const watch = watchBreakpoint(breakpoints, vi.fn());

      expect(watch.current.label).toBe(label);
      expect(watch.current).toEqual(getBreakpoint(breakpoints, width));
      watch.stop();
    });

    it('calls the listener at once when the breakpoint changes, once when several boundaries are crossed, and never within a breakpoint', () => {
      const media = fakeMatchMedia(1000);
      const listener = vi.fn();
      const watch = watchBreakpoint(breakpoints, listener);

      media.resize(1100);
      media.resize(1199);
      expect(listener).not.toHaveBeenCalled();

      media.resize(1200);
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenLastCalledWith({ label: 'lg', limits: [1200, 1399] });

      // From lg to xxs: five boundaries, one call.
      media.resize(400);
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenLastCalledWith({ label: 'xxs', limits: [0, 575] });
      expect(watch.current.label).toBe('xxs');

      watch.stop();
      media.resize(2000);
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('shares the media query of equal minimums, and handles breakpoints that do not start at 0', () => {
      const media = fakeMatchMedia(300);
      const listener = vi.fn();
      const watch = watchBreakpoint({ a: [100, 199], b: [200, 199], c: [200] }, listener);

      expect(media.watched()).toEqual(['(min-width: 100px)', '(min-width: 200px)']);
      expect(watch.current.label).toBe('c');

      media.resize(50);
      expect(listener).toHaveBeenLastCalledWith({ label: '', limits: [] });
      media.resize(150);
      expect(listener).toHaveBeenLastCalledWith({ label: 'a', limits: [100, 199] });
      watch.stop();
    });

    it('does nothing without breakpoints', () => {
      const media = fakeMatchMedia(300);
      const watch = watchBreakpoint({}, vi.fn());

      expect(media.matchMedia).not.toHaveBeenCalled();
      expect(watch.current).toEqual({ label: '', limits: [] });
    });
  });

  describe('isSameBreakpoint, isStylesheetLoad', () => {
    it('compares the label and the limits', () => {
      expect(isSameBreakpoint({ label: 'md', limits: [992, 1199] }, { label: 'md', limits: [992, 1199] })).toBe(true);
      expect(isSameBreakpoint({ label: 'md', limits: [992, 1199] }, { label: 'md', limits: [900, 1199] })).toBe(false);
      expect(isSameBreakpoint({ label: 'md', limits: [992, 1199] }, undefined)).toBe(false);
    });

    it('tells the load of a stylesheet <link> from the other loads', () => {
      const event = (element: Element) => ({ target: element }) as unknown as Event;
      const link = (rel: string) => Object.assign(document.createElement('link'), { rel });
      const stylesheet = link('stylesheet');
      stylesheet.setAttribute('rel', 'preload stylesheet');
      const icon = link('icon');
      icon.setAttribute('rel', 'icon');

      expect(isStylesheetLoad(event(stylesheet))).toBe(true);
      expect(isStylesheetLoad(event(icon))).toBe(false);
      expect(isStylesheetLoad(event(document.createElement('img')))).toBe(false);
    });
  });

  describe('getParamsForBreakpoint', () => {
    const breakpoints = processBreakpoints(THEME_BREAKPOINTS);
    const at = (width: number) => getBreakpoint(breakpoints, width);
    let warnSpy: MockInstance;

    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    const params = { sm: { width: 3 }, lg: { width: 5 } };

    it.each([
      [0, undefined],
      [600, undefined],
      [768, { width: 3 }],
      [1000, { width: 3 }],
      [1200, { width: 5 }],
      [2000, { width: 5 }],
    ])('width %j gives %j (current label, else nearest lower one)', (width, expected) => {
      expect(getParamsForBreakpoint(at(width), params, breakpoints)).toEqual(expected);
    });

    it('picks the nearest lower label, whatever the key order', () => {
      expect(getParamsForBreakpoint(at(1000), { sm: { width: 3 }, xs: { width: 2 } }, breakpoints)).toEqual({ width: 3 });
      expect(getParamsForBreakpoint(at(1000), { xs: { width: 2 }, sm: { width: 3 } }, breakpoints)).toEqual({ width: 3 });
    });

    it('ignores unknown labels with a warning', () => {
      expect(() => getParamsForBreakpoint(at(1000), { tablet: { width: 9 }, sm: { width: 3 } }, breakpoints)).not.toThrow();
      expect(getParamsForBreakpoint(at(1000), { tablet: { width: 9 }, sm: { width: 3 } }, breakpoints)).toEqual({ width: 3 });
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('tablet'));
    });
  });
});
