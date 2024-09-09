import type { Components, JSX } from "../dist/types/components";

interface DsGridItem extends Components.DsGridItem, HTMLElement {}
export const DsGridItem: {
  prototype: DsGridItem;
  new (): DsGridItem;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
