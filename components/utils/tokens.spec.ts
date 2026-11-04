import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { getBreakpoints, getToken } from './tokens';

/** The custom properties the themes declare for their breakpoints (dist/css/<theme>.css, :root). */
const THEME_BREAKPOINT_TOKENS = {
  '--ds-bp-xxs': '360px',
  '--ds-bp-xs': '576px',
  '--ds-bp-sm': '768px',
  '--ds-bp-md': '992px',
  '--ds-bp-lg': '1200px',
  '--ds-bp-xl': '1400px',
  '--ds-bp-xxl': '1600px',
  '--ds-bp-labels': 'xxs xs sm md lg xl xxl',
};

const THEME_BREAKPOINTS = { xxs: 360, xs: 576, sm: 768, md: 992, lg: 1200, xl: 1400, xxl: 1600 };

describe('tokens', () => {
  let getComputedStyleSpy: MockInstance;
  let warnSpy: MockInstance;

  const root = () => document.documentElement;

  /** Declares custom properties on an element, inline (the theme declares them on :root). */
  const declare = (properties: Record<string, string>, element: HTMLElement = root()) =>
    Object.entries(properties).forEach(([name, value]) => element.style.setProperty(name, value));

  beforeEach(() => {
    // The mock DOM computes no style: the computed value of a custom property is the inline one of the element or of its
    // nearest ancestor that has one (custom properties are inherited).
    getComputedStyleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation(
      (element: Element) =>
        ({
          getPropertyValue: (name: string) => {
            for (let node = element as HTMLElement; node; node = node.parentElement) {
              const value = node.style?.getPropertyValue(name);
              if (value) return value;
            }
            return '';
          },
        }) as CSSStyleDeclaration,
    );
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    root().removeAttribute('style');
    document.body.innerHTML = '';
    getComputedStyleSpy.mockRestore();
    warnSpy.mockRestore();
  });

  describe('getToken', () => {
    it('reads a token on :root, with or without the --ds- prefix, trimmed', () => {
      declare({ '--ds-color-primary-base': ' #2563eb ', '--ds-space-4': '1rem' });

      expect(getToken('color-primary-base')).toBe('#2563eb');
      expect(getToken('--ds-color-primary-base')).toBe('#2563eb');
      expect(getToken('space-4')).toBe('1rem');
      expect(getComputedStyleSpy).toHaveBeenCalledWith(root());
    });

    it('reads the value of a scope on an element', () => {
      declare({ '--ds-color-primary-base': '#2563eb' });
      const promo = document.createElement('section');
      const inside = document.createElement('p');
      promo.appendChild(inside);
      document.body.appendChild(promo);
      declare({ '--ds-color-primary-base': '#0d9488' }, promo);

      expect(getToken('color-primary-base', inside)).toBe('#0d9488');
      expect(getToken('color-primary-base', document.body)).toBe('#2563eb');
    });

    it('returns an empty string for a token that is not declared, without a warning', () => {
      expect(getToken('color-primary-base')).toBe('');
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('returns an empty string without getComputedStyle (no browser)', () => {
      getComputedStyleSpy.mockRestore();
      const { getComputedStyle } = window;
      try {
        delete (window as { getComputedStyle?: unknown }).getComputedStyle;
        expect(getToken('color-primary-base')).toBe('');
      } finally {
        window.getComputedStyle = getComputedStyle;
      }
    });
  });

  describe('getBreakpoints', () => {
    it('reads the theme breakpoints from --ds-bp-labels and the --ds-bp-<label> properties, in px', () => {
      declare(THEME_BREAKPOINT_TOKENS);

      const breakpoints = getBreakpoints();

      expect(breakpoints).toEqual(THEME_BREAKPOINTS);
      expect(Object.keys(breakpoints)).toEqual(['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl']);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('splits the labels on any whitespace (and commas), and ignores duplicates', () => {
      declare({ ...THEME_BREAKPOINT_TOKENS, '--ds-bp-labels': '\n  xxs  xs\tsm, md lg xl xxl md ' });

      expect(Object.keys(getBreakpoints())).toEqual(['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl']);
    });

    it('sorts the breakpoints by width, and accepts unitless widths', () => {
      declare({ '--ds-bp-labels': 'lg sm tablet', '--ds-bp-lg': '1200px', '--ds-bp-sm': '0', '--ds-bp-tablet': '768' });

      const breakpoints = getBreakpoints();

      expect(breakpoints).toEqual({ sm: 0, tablet: 768, lg: 1200 });
      expect(Object.keys(breakpoints)).toEqual(['sm', 'tablet', 'lg']);
    });

    it('leaves out the labels without a width in px, with one warning that names them', () => {
      declare({ '--ds-bp-labels': 'xs sm md lg', '--ds-bp-xs': '0', '--ds-bp-md': '62em', '--ds-bp-lg': 'calc(1000px + 200px)' });

      expect(getBreakpoints()).toEqual({ xs: 0 });
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/sm \(missing\), md \(62em\), lg \(calc\(1000px \+ 200px\)\)$/));
    });

    it('returns {} with one warning when the theme stylesheet is not loaded', () => {
      expect(getBreakpoints()).toEqual({});
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('--ds-bp-labels'));
    });

    it('returns {} with one warning when getComputedStyle gives no style (old Firefox, in a hidden iframe)', () => {
      getComputedStyleSpy.mockReturnValue(null);

      expect(getBreakpoints()).toEqual({});
      expect(warnSpy).toHaveBeenCalledTimes(1);
    });

    it('reads the breakpoints of a scope on an element', () => {
      declare(THEME_BREAKPOINT_TOKENS);
      const scope = document.createElement('div');
      document.body.appendChild(scope);
      declare({ '--ds-bp-labels': 'small large', '--ds-bp-small': '0px', '--ds-bp-large': '900px' }, scope);

      expect(getBreakpoints(scope)).toEqual({ small: 0, large: 900 });
      expect(getBreakpoints()).toEqual(THEME_BREAKPOINTS);
    });
  });
});
