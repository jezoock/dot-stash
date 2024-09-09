import type { Components, JSX } from "../dist/types/components";

interface DsTogglerItem extends Components.DsTogglerItem, HTMLElement {}
export const DsTogglerItem: {
  prototype: DsTogglerItem;
  new (): DsTogglerItem;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
