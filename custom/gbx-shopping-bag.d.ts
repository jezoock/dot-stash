import type { Components, JSX } from "../dist/types/components";

interface DSShoppingBag extends Components.DSShoppingBag, HTMLElement {}
export const DSShoppingBag: {
  prototype: DSShoppingBag;
  new (): DSShoppingBag;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
