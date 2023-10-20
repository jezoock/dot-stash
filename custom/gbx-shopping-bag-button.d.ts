import type { Components, JSX } from "../dist/types/components";

interface DSShoppingBagButton extends Components.DSShoppingBagButton, HTMLElement {}
export const DSShoppingBagButton: {
  prototype: DSShoppingBagButton;
  new (): DSShoppingBagButton;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
