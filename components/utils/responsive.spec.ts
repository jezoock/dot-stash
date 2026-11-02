import { getBreakpoint, getParamsForBreakpoint, isDesktop, isMobile, isTablet, processBreakpoints } from './responsive';

/** The theme breakpoints (scss/engine/variables/_breakpoints.scss), as tokens.getBreakpoints() reads them. */
const THEME_BREAKPOINTS = { xxs: 360, xs: 576, sm: 768, md: 992, lg: 1200, xl: 1400, xxl: 1600 };

describe('responsive', () => {
  describe('isMobile, isTablet, isDesktop', () => {
    let tokens: Record<string, string>;
    let innerWidth: number;

    beforeEach(() => {
      innerWidth = window.innerWidth;
      tokens = {};
      // The theme custom properties: the mock DOM computes no style.
      jest.spyOn(window, 'getComputedStyle').mockImplementation(() => ({ getPropertyValue: (name: string) => tokens[name] ?? '' }) as CSSStyleDeclaration);
    });

    afterEach(() => {
      (window as { innerWidth: number }).innerWidth = innerWidth;
      jest.restoreAllMocks();
    });

    const at = (width: number) => {
      (window as { innerWidth: number }).innerWidth = width;
      return [isMobile(), isTablet(), isDesktop()];
    };

    it.each([
      [767, [true, false, false]],
      [768, [false, true, false]],
      [991, [false, true, false]],
      [992, [false, false, true]],
    ])('without the theme, uses 768 and 992 px: width %p', (width, expected) => {
      expect(at(width)).toEqual(expected);
    });

    it.each([
      [599, [true, false, false]],
      [600, [false, true, false]],
      [1023, [false, true, false]],
      [1024, [false, false, true]],
    ])('uses the sm and md breakpoints of the theme (--ds-bp-sm: 600px, --ds-bp-md: 1024px): width %p', (width, expected) => {
      tokens = { '--ds-bp-sm': '600px', '--ds-bp-md': ' 1024px' };
      expect(at(width)).toEqual(expected);
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
    ])('width %p is %p %p', (width, label, limits) => {
      expect(getBreakpoint(breakpoints, width)).toEqual({ label, limits });
    });

    it('reads the window width by default', () => {
      const innerWidth = window.innerWidth;
      try {
        (window as { innerWidth: number }).innerWidth = 800;
        expect(getBreakpoint(breakpoints).label).toBe('sm');
      } finally {
        (window as { innerWidth: number }).innerWidth = innerWidth;
      }
    });

    it('returns an empty label without breakpoints', () => {
      expect(getBreakpoint({}, 500)).toEqual({ label: '', limits: [] });
    });
  });

  describe('getParamsForBreakpoint', () => {
    const breakpoints = processBreakpoints(THEME_BREAKPOINTS);
    const at = (width: number) => getBreakpoint(breakpoints, width);
    let warnSpy: jest.SpyInstance;

    beforeEach(() => {
      warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    const params = { sm: { width: 3 }, lg: { width: 5 } };

    it.each([
      [0, undefined],
      [600, undefined],
      [768, { width: 3 }],
      [1000, { width: 3 }],
      [1200, { width: 5 }],
      [2000, { width: 5 }],
    ])('width %p gives %p (current label, else nearest lower one)', (width, expected) => {
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
