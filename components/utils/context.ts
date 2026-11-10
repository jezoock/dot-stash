/**
 * Component contexts: the boolean properties (`block`, `section`…) some components use to adapt to where they are.
 */

export type AnyDsContextComponentElement = object;
export type DsComponentContextType = 'block' | 'article' | 'section' | 'form' | 'modal' | 'page';
export const DsComponentContext: DsComponentContextType[] = ['block', 'article', 'section', 'form', 'modal', 'page'];

/** Returns the first context property set on the element, or `undefined`. */
export const get = (element: AnyDsContextComponentElement): DsComponentContextType => {
  return DsComponentContext.find(context => element[context]);
};
