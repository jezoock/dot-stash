import type { Components, JSX } from "../dist/types/components";

interface GbxShoppingBag extends Components.GbxShoppingBag, HTMLElement {}
export const GbxShoppingBag: {
  prototype: GbxShoppingBag;
  new (): GbxShoppingBag;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
