import type { Components, JSX } from "../dist/types/components";

interface DSShoppingBagList extends Components.DSShoppingBagList, HTMLElement {}
export const DSShoppingBagList: {
  prototype: DSShoppingBagList;
  new (): DSShoppingBagList;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
