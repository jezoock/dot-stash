import { vi } from 'vitest';

/** The simulated DOM computes no style: getComputedStyle() gives this style, for every element. */
export const mockComputedStyle = (style: Partial<Record<keyof CSSStyleDeclaration, unknown>>) => vi.spyOn(window, 'getComputedStyle').mockReturnValue(style as CSSStyleDeclaration);

/** The computed transition of the elements (see mockComputedStyle()), which the components wait for. */
export const mockTransition = (transitionDuration: string, transitionDelay = '0s') => mockComputedStyle({ transitionDuration, transitionDelay });

/**
 * The custom properties the theme stylesheet gives the elements (`--ds-bp-md`…), which getComputedStyle() then gives,
 * for every element: an object, or a function that gives the current ones (none: an empty string, as without a theme).
 */
export const mockTokens = (tokens: Record<string, string> | (() => Record<string, string>)) =>
  vi
    .spyOn(window, 'getComputedStyle')
    .mockImplementation(() => ({ getPropertyValue: (name: string) => (typeof tokens === 'function' ? tokens() : tokens)[name] ?? '' }) as CSSStyleDeclaration);

/** The sizes of an element, in pixels, that mockLayout() gives. */
export type LayoutSizes = Partial<Record<'offsetWidth' | 'offsetHeight', (element: HTMLElement) => number>>;

/**
 * The simulated DOM has no layout: this gives every element the sizes that the functions return for it (`offsetWidth`,
 * `offsetHeight`). Returns the function that removes them.
 */
export const mockLayout = (sizes: LayoutSizes) => {
  const elementPrototype = Object.getPrototypeOf(Object.getPrototypeOf(document.createElement('div')));
  for (const [name, size] of Object.entries(sizes)) {
    Object.defineProperty(elementPrototype, name, {
      configurable: true,
      get(this: HTMLElement) {
        return size(this);
      },
    });
  }
  return () => Object.keys(sizes).forEach(name => delete elementPrototype[name]);
};
