import type { Components, JSX } from "../dist/types/components";

interface DsSlider extends Components.DsSlider, HTMLElement {}
export const DsSlider: {
  prototype: DsSlider;
  new (): DsSlider;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
