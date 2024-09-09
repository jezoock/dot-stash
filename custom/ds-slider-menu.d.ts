import type { Components, JSX } from "../dist/types/components";

interface DsSliderMenu extends Components.DsSliderMenu, HTMLElement {}
export const DsSliderMenu: {
  prototype: DsSliderMenu;
  new (): DsSliderMenu;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
