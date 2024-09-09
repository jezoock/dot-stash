import type { Components, JSX } from "../dist/types/components";

interface DSShoppingBagProducts extends Components.DSShoppingBagProducts, HTMLElement {}
export const DSShoppingBagProducts: {
  prototype: DSShoppingBagProducts;
  new (): DSShoppingBagProducts;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
