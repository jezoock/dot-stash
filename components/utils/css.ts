/**
 * Helpers for inline styles (`element.style`).
 */

/** Sets each style of `pairs` on every element. */
export const set = (pairs: Partial<CSSStyleDeclaration>, elements: HTMLElement[]): void => {
  Object.keys(pairs).forEach(prop => {
    elements.forEach(element => {
      element.style[prop] = pairs[prop];
    });
  });
};

/** Reads the given inline styles of an element. */
export const get = (props: (keyof CSSStyleDeclaration)[], element: HTMLElement): Partial<CSSStyleDeclaration> => {
  const CSSProps = {};
  props.map(prop => (CSSProps[prop] = element.style[prop]));
  return CSSProps;
};

/** Reads an inline style as an integer (`'12px'` gives `12`). */
export const toNumber = (prop: keyof CSSStyleDeclaration, element: HTMLElement): number => parseInt((element.style[prop] as string).replace('px', ''), 10);
