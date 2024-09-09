import type { Components, JSX } from "../dist/types/components";

interface DsSliderItem extends Components.DsSliderItem, HTMLElement {}
export const DsSliderItem: {
  prototype: DsSliderItem;
  new (): DsSliderItem;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
